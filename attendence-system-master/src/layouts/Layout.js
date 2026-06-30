import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogOut,
  Sun,
  Moon,
  Users,
  UserPlus,
  CheckSquare,
  FileText,
  LayoutDashboard,
  User,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not logged in, just render children directly (e.g. for login pages)
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">{children}</div>;
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navLinks = [
    // Dashboard (Unified)
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      role: ['admin', 'faculty', 'student'],
      path: '/dashboard'
    },
    // View Students
    {
      label: 'View Students',
      icon: <Users size={18} />,
      role: ['admin', 'faculty'],
      path: '/students'
    },
    // Add Student
    {
      label: 'Add Student',
      icon: <UserPlus size={18} />,
      role: ['admin', 'faculty'],
      path: '/students/new'
    },
    // Mark Attendance
    {
      label: 'Mark Attendance',
      icon: <CheckSquare size={18} />,
      role: ['admin', 'faculty'],
      path: '/attendance/mark'
    },
    // Attendance Report
    {
      label: 'Attendance Report',
      icon: <FileText size={18} />,
      role: ['admin', 'faculty', 'student'],
      path: '/attendance/report'
    },
    // Profile
    {
      label: 'My Profile',
      icon: <User size={18} />,
      role: ['admin', 'faculty', 'student'],
      path: '/profile'
    }
  ];

  const filteredLinks = navLinks.filter(link => link.role.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-colors">
      {/* Header Brand */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-150">
          A
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-gray-800 dark:text-white leading-none">
            Attendance Hub
          </h1>
          <span className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase mt-1 inline-block">
            {user.role} Portal
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredLinks.map((link) => {
          const isActive = window.location.pathname === link.path;
          return (
            <a
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* User profile bottom footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden border border-gray-100 dark:border-slate-700">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            ) : (
              user.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-850 dark:text-white truncate">
              {user.name}
            </h4>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {user.email || user.roll || 'User'}
            </p>
          </div>
        </div>

        {/* Theme and Logout actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors font-medium text-xs"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 z-30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow">
            A
          </div>
          <span className="font-bold text-sm text-gray-800 dark:text-white">
            Attendance Hub
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Sidebar Overlay - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="relative w-64 h-full animate-slide-right max-w-xs flex-1 flex flex-col bg-white">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-650"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
