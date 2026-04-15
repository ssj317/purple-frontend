import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="bg-primary-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg tracking-wide">Purple M</span>
        <Link to="/dashboard" className="text-sm hover:text-primary-100 transition">Dashboard</Link>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Link to="/users" className="text-sm hover:text-primary-100 transition">Users</Link>
        )}
        <Link to="/profile" className="text-sm hover:text-primary-100 transition">My Profile</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs bg-primary-800 px-2 py-1 rounded capitalize">{user?.role}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-white text-primary-700 px-3 py-1 rounded hover:bg-primary-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
