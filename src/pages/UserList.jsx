import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from "../api/users.api";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", email: "", password: "", role: "user", status: "active" };

export default function UserList() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [visibleRows, setVisibleRows] = useState([]);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setVisibleRows([]);
    try {
      const { data } = await getUsersApi({ page, limit, search, ...filters });
      setUsers(data.users);
      setTotal(data.total);
      // Stagger row entrance animations
      data.users.forEach((_, i) => {
        setTimeout(() => setVisibleRows((prev) => [...prev, i]), i * 50);
      });
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal("create"); };
  const openEdit = (u) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, status: u.status });
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "create") {
        await createUserApi(form);
        toast.success("User created");
      } else {
        const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
        if (form.password) payload.password = form.password;
        await updateUserApi(selected._id, payload);
        toast.success("User updated");
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u) => {
    const isActive = u.status === "active";
    const action = isActive ? "Deactivate" : "Reactivate";
    if (!confirm(`${action} ${u.name}?`)) return;
    setTogglingId(u._id);
    try {
      if (isActive) {
        await deleteUserApi(u._id);
      } else {
        await updateUserApi(u._id, { status: "active" });
      }
      toast.success(`User ${isActive ? "deactivated" : "reactivated"}`);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    } finally {
      setTogglingId(null);
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Users</h1>
            <p className="text-sm text-gray-500">{total} total</p>
          </div>
          {me?.role === "admin" && (
            <button
              onClick={openCreate}
              className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
            >
              + Create User
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 animate-fade-in">
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
          <select
            value={filters.role}
            onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <Spinner /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="text-3xl mb-2">👤</div>
                      No users found
                    </td>
                  </tr>
                ) : users.map((u, i) => (
                  <tr
                    key={u._id}
                    className={`transition-all duration-300 hover:bg-primary-50 ${
                      u.status === "inactive" ? "opacity-60" : ""
                    } ${
                      visibleRows.includes(i)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5"><Badge value={u.role} /></td>
                    <td className="px-5 py-3.5"><Badge value={u.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{u.createdBy?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/users/${u._id}`}
                          className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                        >
                          View
                        </Link>
                        {(me?.role === "admin" || (me?.role === "manager" && u.role !== "admin")) && (
                          <button
                            onClick={() => openEdit(u)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {me?.role === "admin" && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={togglingId === u._id}
                            className={`text-xs font-medium transition-all duration-150 disabled:opacity-50 ${
                              u.status === "active"
                                ? "text-red-400 hover:text-red-600"
                                : "text-green-500 hover:text-green-700"
                            }`}
                          >
                            {togglingId === u._id
                              ? "..."
                              : u.status === "active"
                              ? "Deactivate"
                              : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              ←
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150 ${
                  p === page
                    ? "bg-primary-600 text-white shadow-sm scale-105"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal === "create" ? "Create User" : "Edit User"} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {modal === "edit" && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={modal === "create"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
            <div className="flex gap-3">
              {(me?.role === "admin" || modal === "create") && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              {modal === "edit" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition active:scale-95">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="text-sm px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition active:scale-95 disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
