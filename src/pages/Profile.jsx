import { useState, useEffect } from "react";
import { getProfileApi, updateProfileApi } from "../api/users.api";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", password: "" });

  useEffect(() => {
    getProfileApi()
      .then(({ data }) => {
        setProfile(data.user);
        setForm({ name: data.user.name, password: "" });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      const { data } = await updateProfileApi(payload);
      setProfile(data.user);
      setForm({ name: data.user.name, password: "" });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profile?.name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge value={profile?.role} />
            <Badge value={profile?.status} />
          </div>
          {profile?.createdBy && (
            <p className="text-xs text-gray-400 mt-3">Created by: {profile.createdBy.name}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-gray-400">(leave blank to keep)</span></label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
