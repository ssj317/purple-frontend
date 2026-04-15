import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserByIdApi } from "../api/users.api";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserByIdApi(id)
      .then(({ data }) => setUser(data.user))
      .catch(() => { toast.error("User not found"); navigate("/users"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="text-sm text-primary-600 hover:underline mb-6 inline-block">
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <Badge value={user?.role} />
            <Badge value={user?.status} />
          </div>

          <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Created At</span>
              <span>{new Date(user?.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated At</span>
              <span>{new Date(user?.updatedAt).toLocaleString()}</span>
            </div>
            {user?.createdBy && (
              <div className="flex justify-between">
                <span className="text-gray-400">Created By</span>
                <span>{user.createdBy.name} ({user.createdBy.email})</span>
              </div>
            )}
            {user?.updatedBy && (
              <div className="flex justify-between">
                <span className="text-gray-400">Updated By</span>
                <span>{user.updatedBy.name} ({user.updatedBy.email})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
