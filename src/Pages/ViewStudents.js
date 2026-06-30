import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Search, Edit2, Trash2, X, Check, Users } from 'lucide-react';

const ViewStudents = () => {
  const { addToast } = useToast();

  const [filters, setFilters] = useState({ department: '', year: '' });
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoll, setEditingRoll] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', year: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/filter', {
        params: {
          department: filters.department || undefined,
          year: filters.year || undefined,
          search: search || undefined,
        },
      });
      setStudents(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to retrieve student records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, search, addToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const startEdit = (student) => {
    setEditingRoll(student.roll);
    setEditForm({ name: student.name, department: student.department, year: student.year });
  };

  const cancelEdit = () => setEditingRoll(null);

  const saveEdit = async (roll) => {
    if (!editForm.name.trim() || !editForm.department || !editForm.year) {
      addToast('All student fields are required', 'warning');
      return;
    }
    try {
      setLoading(true);
      await api.put(`/student/update/${roll}`, editForm);
      addToast('Student details updated successfully', 'success');
      setEditingRoll(null);
      loadStudents();
    } catch (err) {
      addToast(err.message || 'Failed to update student profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!studentToDelete) return;
    try {
      setLoading(true);
      await api.delete(`/student/delete/${studentToDelete.roll}`);
      addToast('Student deleted successfully', 'success');
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      loadStudents();
    } catch (err) {
      addToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'BCA', label: 'BCA' },
    { value: 'BCom', label: 'BCom' },
    { value: 'BA', label: 'BA' },
  ];

  const editDepts = [
    { value: 'BCA', label: 'BCA' },
    { value: 'BCom', label: 'BCom' },
    { value: 'BA', label: 'BA' },
  ];

  const years = [
    { value: '', label: 'All Years' },
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
  ];

  const editYears = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Users size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">View & Manage Students</h2>
          <p className="text-xs text-gray-500 mt-0.5">Filter, search, modify, and manage registered student accounts.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2 relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <Input
            label="Department"
            type="select"
            options={departments}
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="mb-0"
          />
          <Input
            label="Year"
            type="select"
            options={years}
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="mb-0"
          />
        </div>
      </Card>

      {/* Students Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800 shadow bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-gray-300">
              <th className="px-6 py-4">Profile</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Roll Number</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs text-gray-500">Retrieving student list...</span>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <span className="text-sm font-medium text-gray-400">No students found matching current criteria.</span>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isEditing = editingRoll === student.roll;
                return (
                  <tr key={student.roll} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isEditing ? 'bg-indigo-50 dark:bg-indigo-950' : ''}`}>
                    <td className="px-6 py-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-indigo-500">
                        {student.profile_picture ? (
                          <img src={student.profile_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800 dark:text-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 w-full"
                        />
                      ) : student.name}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{student.roll}</td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white"
                        >
                          {editDepts.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-semibold">{student.department}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                          className="px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white"
                        >
                          {editYears.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>
                      ) : `${student.year} Year`}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(student.roll)} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Save">
                              <Check size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" title="Cancel">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(student)} className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-400 transition-colors" title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => triggerDelete(student)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400 transition-colors" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion" size="sm">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Permanently delete <strong>{studentToDelete?.name}</strong> (Roll: {studentToDelete?.roll})?
          </p>
          <div className="bg-red-50 dark:bg-rose-950 border border-red-100 dark:border-rose-900 rounded-xl p-3 text-left">
            <span className="text-xs text-red-700 dark:text-rose-400 font-medium">
              ⚠️ This will also delete all attendance logs. This action is irreversible.
            </span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={executeDelete} loading={loading}>Delete Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewStudents;
