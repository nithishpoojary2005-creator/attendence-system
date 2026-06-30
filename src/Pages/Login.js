import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { ShieldCheck, User, Users } from 'lucide-react';

const schema = yup.object().shape({
  loginId: yup.string().required('Email, Username, or Roll Number is required'),
  password: yup.string().min(5, 'Password must be at least 5 characters').required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [role, setRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.loginId, data.password);
      addToast('Welcome back! Login successful.', 'success');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleHeader = () => {
    if (role === 'admin') return { title: 'Admin Portal', desc: 'Secure panel for global system configuration' };
    if (role === 'faculty') return { title: 'Faculty Portal', desc: 'Manage classrooms and take student attendance' };
    return { title: 'Student Portal', desc: 'Check your overall presence percentage and records' };
  };

  const roleHeader = getRoleHeader();

  return (
    <div className="w-full max-w-md px-4 py-8">
      {/* Brand Icon Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-150 mb-3 animate-pulse">
          A
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          Attendance System
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Modern, automated class check-in system
        </p>
      </div>

      <Card className="glass-card shadow-xl p-8 border border-white border-opacity-40">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-105 dark:bg-slate-800 rounded-xl mb-6">
          <button
            onClick={() => handleRoleChange('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'student'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User size={14} />
            Student
          </button>
          <button
            onClick={() => handleRoleChange('faculty')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'faculty'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users size={14} />
            Faculty
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'admin'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheck size={14} />
            Admin
          </button>
        </div>

        {/* Portal Header Description */}
        <div className="text-left mb-6">
          <h2 className="text-lg font-bold text-gray-850 dark:text-white">
            {roleHeader.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {roleHeader.desc}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={role === 'student' ? 'Roll Number or Email' : 'Email address'}
            type="text"
            placeholder={role === 'student' ? 'e.g. BCA-01 or student@school.com' : 'e.g. professor@school.com'}
            error={errors.loginId}
            {...register('loginId')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password')}
          />

          {role === 'student' && (
            <div className="bg-indigo-50 dark:bg-indigo-950 dark:bg-opacity-50 border border-indigo-100 dark:border-indigo-900 rounded-xl p-3 text-left">
              <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-300">
                <strong>💡 Tip:</strong> If this is your first time logging in, your default password is your <strong>Roll Number</strong> (capitalized, e.g. BCA-01).
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 py-2.5 text-sm"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      </Card>
      
      {/* Help seed info */}
      <div className="mt-8 text-center text-[11px] text-gray-400">
        <p>Default Admin: <strong>admin@example.com</strong> | password: <strong>admin123</strong></p>
        <p className="mt-1">Default Faculty: <strong>faculty@example.com</strong> | password: <strong>faculty123</strong></p>
      </div>
    </div>
  );
};

export default Login;
