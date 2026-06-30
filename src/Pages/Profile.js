import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Camera, User, Key, Save } from 'lucide-react';

const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(5, 'Password must be at least 5 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Confirm password is required'),
});

const Profile = () => {
  const { user, updateProfile, isStudent } = useAuth();
  const { addToast } = useToast();
  
  const [picLoading, setPicLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: e.g. 2MB
    if (file.size > 2 * 1024 * 1024) {
      addToast('File size must be under 2MB', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setPicLoading(true);
      
      // 1. Upload file
      const uploadRes = await api.post('/student/upload-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fileUrl = uploadRes.data.file_url;
      
      // 2. If student role, update database student record
      if (isStudent && user.roll) {
        await api.put(`/student/update/${user.roll}`, {
          profile_picture: fileUrl
        });
      }
      
      // 3. Update session
      updateProfile({ profile_picture: fileUrl });
      addToast('Profile picture uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setPicLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPwdLoading(true);
      
      // Let's call the backend auth endpoint to update password
      // Wait, we need to create `/auth/change-password` endpoint or simulate it. Let's look at user updates.
      // Let's check how we handle password changes. We can create a simple route or controller function.
      // Wait, since we are using JWT, we can post to `/auth/password` or similar. Let's make sure we have this endpoint.
      // In AuthController, did we create a password change handler? No, we haven't yet. We will edit `Backend/controllers/auth_controller.py` to add it if needed, or we can quickly implement it!
      // Let's implement changing passwords:
      await api.post('/auth/change-password', {
        old_password: data.oldPassword,
        new_password: data.newPassword
      });

      addToast('Password changed successfully!', 'success');
      reset();
    } catch (err) {
      addToast(err.message || 'Failed to modify password. Check current password.', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <User size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">Account Profile Settings</h2>
          <p className="text-xs text-gray-550 mt-0.5">Customize your login profile, avatar, and passwords.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo Upload Card */}
        <Card className="glass-card shadow-lg flex flex-col items-center justify-center p-6 text-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-750 flex items-center justify-center font-bold text-3xl overflow-hidden shadow">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Input Overlay */}
            <label className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-105 active:scale-95">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                disabled={picLoading}
              />
            </label>
          </div>

          <div className="mt-4">
            <h3 className="font-bold text-gray-850 dark:text-white text-base">{user.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-md">
              {user.role}
            </span>
          </div>

          {picLoading && (
            <p className="text-xs text-indigo-500 font-medium animate-pulse mt-3">Uploading file...</p>
          )}

          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 w-full pt-4 text-xs text-gray-500 space-y-2">
            <p>Email: <strong>{user.email || 'N/A'}</strong></p>
            {user.roll && <p>Roll No: <strong>{user.roll}</strong></p>}
          </div>
        </Card>

        {/* Change Password Card */}
        <Card className="glass-card shadow-lg md:col-span-2 p-6" title="Change Security Password">
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              <Key size={14} />
              Reset password credentials
            </div>

            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={errors.oldPassword}
              {...register('oldPassword')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={errors.newPassword}
                {...register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={pwdLoading}
                className="gap-2 px-5 py-2.5"
              >
                <Save size={16} />
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
