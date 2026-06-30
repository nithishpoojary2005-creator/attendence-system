import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { UserPlus } from 'lucide-react';

const schema = yup.object().shape({
  name: yup.string().required('Full Name is required').min(2, 'Name must be at least 2 characters'),
  roll: yup.string().required('Roll number is required').matches(/^[a-zA-Z0-9-]+$/, 'Invalid roll format (alphanumeric and dashes allowed)'),
  department: yup.string().required('Department selection is required'),
  year: yup.string().required('Year selection is required'),
});

const StudentForm = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      roll: '',
      department: '',
      year: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post('/student/add', data);
      addToast('Student profile added successfully! Login credential was provisioned.', 'success');
      reset();
    } catch (err) {
      addToast(err.message || 'Failed to register student.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'BCA', label: 'BCA' },
    { value: 'BCom', label: 'BCom' },
    { value: 'BA', label: 'BA' }
  ];

  const years = [
    { value: '', label: 'Select Year' },
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' }
  ];

  return (
    <div className="max-w-xl mx-auto text-left">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <UserPlus size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">Add Student Profile</h2>
          <p className="text-xs text-gray-500 mt-0.5">Provision new student accounts and database records.</p>
        </div>
      </div>

      <Card className="glass-card shadow-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Student Name"
            type="text"
            placeholder="Enter full name"
            error={errors.name}
            {...register('name')}
          />

          <Input
            label="Roll Number"
            type="text"
            placeholder="e.g. BCA-01"
            error={errors.roll}
            {...register('roll')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              type="select"
              options={departments}
              error={errors.department}
              {...register('department')}
            />

            <Input
              label="Academic Year"
              type="select"
              options={years}
              error={errors.year}
              {...register('year')}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-750 text-xs text-slate-500 leading-relaxed">
            <p>
              <strong>📌 Note:</strong> After saving, a student account will be automatically configured. The student will be able to log in immediately using their <strong>Roll Number</strong> as both login ID and password.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset()}
              disabled={loading}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Save Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
