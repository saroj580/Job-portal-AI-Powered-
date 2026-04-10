import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/jobs" className="text-xl font-bold text-indigo-600">
          JobPortal
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/jobs" className="text-gray-600 hover:text-indigo-600">
            Jobs
          </Link>

          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link to="/dashboard"       className="text-gray-600 hover:text-indigo-600">My Applications</Link>
                  <Link to="/resume/upload"   className="text-gray-600 hover:text-indigo-600">Resume</Link>
                  <Link to="/resume/analysis" className="text-gray-600 hover:text-indigo-600">AI Analysis</Link>
                </>
              )}
              {user.role === 'recruiter' && (
                <Link to="/recruiter" className="text-gray-600 hover:text-indigo-600">
                  Dashboard
                </Link>
              )}
              <span className="text-gray-400 text-xs">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-gray-600 hover:text-indigo-600">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}