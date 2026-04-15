import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome back{user?.id ? "" : ""}!
        </h1>
        <p className="text-gray-500 text-sm mb-8 capitalize">Logged in as <span className="font-medium text-primary-600">{user?.role}</span></p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/profile" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="text-3xl mb-2">👤</div>
            <h2 className="font-semibold text-gray-800">My Profile</h2>
            <p className="text-sm text-gray-500 mt-1">View and update your profile</p>
          </Link>

          {(user?.role === "admin" || user?.role === "manager") && (
            <Link to="/users" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="text-3xl mb-2">👥</div>
              <h2 className="font-semibold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-500 mt-1">View, create and manage users</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
