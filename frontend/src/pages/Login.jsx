import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogIn, Shield, User, GraduationCap, Wrench, AlertCircle } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      redirectByRole(res.user?.role);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    switch (role) {
      case 'admin':
        navigate('/dashboard/admin', { replace: true });
        break;
      case 'faculty':
        navigate('/dashboard/faculty', { replace: true });
        break;
      case 'technician':
        navigate('/dashboard/technician', { replace: true });
        break;
      case 'student':
      default:
        navigate('/dashboard/student', { replace: true });
        break;
    }
  };

  // Quick Demo Account Helper (for MCA Viva Demonstration)
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/25">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Lab<span className="text-primary-600">Loop</span>
          </span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          Sign In to Laboratory Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Intelligent Laboratory Resource Sharing & Utilization Management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200/80 rounded-3xl sm:px-10">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@labloop.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Demonstration Quick Roles Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              One-Click Demo Accounts (Viva Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@labloop.edu', 'Password@123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-primary-600 font-semibold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  admin@labloop.edu
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('faculty.cse@labloop.edu', 'Password@123')
                }
                className="p-2 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-primary-600 font-semibold text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  faculty.cse@labloop.edu
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('student@labloop.edu', 'Password@123')
                }
                className="p-2 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-primary-600 font-semibold text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  student@labloop.edu
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('technician@labloop.edu', 'Password@123')
                }
                className="p-2 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 text-primary-600 font-semibold text-xs">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Technician</span>
                </div>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  technician@labloop.edu
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

