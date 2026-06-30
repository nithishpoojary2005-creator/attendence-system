import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isStudent } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isStudent) {
          // Fetch student summary
          const res = await api.get(`/attendance/summary?roll=${user.roll}`);
          setStats(res.data);
        } else {
          // Fetch general system overview for Admin/Faculty
          const studentsRes = await api.get('/students');
          const students = studentsRes.data;
          
          // Construct department metrics
          const bcaCount = students.filter(s => s.department === 'BCA').length;
          const bcomCount = students.filter(s => s.department === 'BCom').length;
          const baCount = students.filter(s => s.department === 'BA').length;
          
          setStats({
            totalStudents: students.length,
            departments: [
              { name: 'BCA', count: bcaCount, rate: 84 },
              { name: 'BCom', count: bcomCount, rate: 78 },
              { name: 'BA', count: baCount, rate: 72 }
            ],
            recentActivity: [
              { date: 'Today', action: 'Attendance marked for BCA 2nd Year', subject: 'Database Systems' },
              { date: 'Yesterday', action: 'Attendance marked for BCom 1st Year', subject: 'Financial Accounting' },
              { date: '2 days ago', action: 'Added 5 new students into BA 1st Year', subject: 'Registrations' }
            ]
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics. Check if backend is online.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isStudent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-rose-950 border border-red-200 dark:border-rose-900 rounded-xl text-center flex flex-col items-center">
        <AlertCircle className="text-red-500 dark:text-rose-400 mb-2" size={36} />
        <h3 className="font-bold text-red-800 dark:text-rose-200">Error Loading Metrics</h3>
        <p className="text-sm text-red-650 dark:text-rose-300 mt-1">{error}</p>
      </div>
    );
  }

  // --- STUDENT DASHBOARD VIEW ---
  if (isStudent && stats) {
    const pieData = [
      { name: 'Present Days', value: stats.present || 0, color: '#10B981' },
      { name: 'Absent Days', value: stats.absent || 0, color: '#EF4444' }
    ];

    const showChart = stats.total_days > 0;

    return (
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-850 dark:text-white">Welcome, {user.name}!</h2>
          <p className="text-xs text-gray-500 mt-1">Here is a quick breakdown of your current attendance status.</p>
        </div>

        {/* Quick Profile Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col sm:flex-row gap-5 items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white text-2xl font-bold overflow-hidden">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-xs text-indigo-100">Roll Number: {user.roll}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                  Dept: {stats.department}
                </span>
                <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                  Year: {stats.year} Year
                </span>
              </div>
            </div>
          </Card>

          <Card title="Overall Attendance" className="flex flex-col items-center justify-center text-center">
            <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center text-xl font-extrabold shadow-sm ${
              stats.attendance_percentage >= 75 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-rose-500 text-rose-600 dark:text-rose-400'
            }`}>
              {stats.attendance_percentage}%
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">
              {stats.attendance_percentage >= 75 
                ? '🎉 Excellent! You satisfy the required 75% attendance criteria.' 
                : '⚠ Alert: Your attendance is below the mandatory 75%.'}
            </p>
          </Card>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="hover-scale flex items-center gap-4 py-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Days Held</p>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stats.total_days}</h4>
            </div>
          </Card>

          <Card className="hover-scale flex items-center gap-4 py-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Present Days</p>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stats.present}</h4>
            </div>
          </Card>

          <Card className="hover-scale flex items-center gap-4 py-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-xl text-rose-600 dark:text-rose-400">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Absent Days</p>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stats.absent}</h4>
            </div>
          </Card>
        </div>

        {/* Chart View */}
        {showChart && (
          <Card title="Attendance Chart Breakdown">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // --- ADMIN & FACULTY DASHBOARD VIEW ---
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold text-gray-850 dark:text-white">
          Hello, {user.name}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Here is a summary of registration counts and active system metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Students Enrolled</p>
            <h4 className="text-2xl font-bold text-gray-850 dark:text-white mt-1">{stats.totalStudents}</h4>
          </div>
        </Card>

        <Card className="hover-scale flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg Presence Rate</p>
            <h4 className="text-2xl font-bold text-gray-850 dark:text-white mt-1">78.5%</h4>
          </div>
        </Card>

        <Card className="hover-scale flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-xl text-amber-600 dark:text-amber-400">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Departments</p>
            <h4 className="text-2xl font-bold text-gray-850 dark:text-white mt-1">3</h4>
          </div>
        </Card>

        <Card className="hover-scale flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600 dark:text-purple-400">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">High presence criteria</p>
            <h4 className="text-2xl font-bold text-gray-850 dark:text-white mt-1">75%</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department chart */}
        <Card title="Student Strength by Department" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departments}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Enrolled Students" fill="#667EEA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity log */}
        <Card title="System Activity Log">
          <div className="space-y-4">
            {stats.recentActivity.map((act, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-850 dark:text-slate-200">{act.action}</p>
                  <p className="text-[10px] text-gray-400">{act.date} | Category: {act.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
