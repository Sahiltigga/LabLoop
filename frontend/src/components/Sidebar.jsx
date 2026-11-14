import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  CalendarCheck,
  Wrench,
  BarChart3,
  Sparkles,
  Building2,
  Users,
  LogOut,
  X,
  Layers,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine dashboard route based on user role
  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'faculty':
        return '/dashboard/faculty';
      case 'technician':
        return '/dashboard/technician';
      case 'student':
      default:
        return '/dashboard/student';
    }
  };

  // Role-specific navigation links
  const navItems = [
    {
      label: 'Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
      roles: ['admin', 'faculty', 'student', 'technician'],
    },
    {
      label: 'Equipment Catalog',
      path: '/equipment',
      icon: Cpu,
      roles: ['admin', 'faculty', 'student', 'technician'],
    },
    {
      label: 'Reservations & Bookings',
      path: '/bookings',
      icon: CalendarCheck,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      label: 'Intelligence Engine',
      path: '/recommendations',
      icon: Sparkles,
      roles: ['admin', 'faculty', 'student', 'technician'],
      highlight: true,
    },
    {
      label: 'Maintenance & Repairs',
      path: '/maintenance',
      icon: Wrench,
      roles: ['admin', 'faculty', 'technician', 'student'],
    },
    {
      label: 'Utilization Analytics',
      path: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'faculty'],
    },
    {
      label: 'Academic Departments',
      path: '/departments',
      icon: Building2,
      roles: ['admin', 'faculty'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-[#111827] text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                Lab<span className="text-primary-500">Loop</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Resource Intelligence
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge Banner */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-primary-400 tracking-wider">
              {user?.role} Portal
            </span>
            <span className="block text-xs font-semibold text-white truncate">
              {user?.department?.name || 'Central Administration'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-primary-400 hover:bg-slate-800/80 hover:text-primary-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 bg-primary-500/20 text-primary-300 rounded font-bold uppercase">
                    AI/Rules
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-400">
              LabLoop v1.0 • MCA Capstone
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

