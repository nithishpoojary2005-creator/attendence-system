import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Calendar, CheckSquare, ListFilter, Users } from 'lucide-react';

const MarkAttendance = () => {
  const { addToast } = useToast();

  const [form, setForm] = useState({
    department: '',
    year: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    const { department, year, date } = form;

    if (!department || !year || !date) {
      addToast('Please select all filters to load students', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/students/filter', {
        params: { department, year }
      });

      if (res.data.length === 0) {
        addToast('No students registered for this class.', 'warning');
        setShowTable(false);
        return;
      }

      // Map students with default present status (true) and specified date
      const attendanceList = res.data.map(s => ({
        ...s,
        date,
        status: true // Present by default
      }));

      setStudents(attendanceList);
      setShowTable(true);
      addToast(`Loaded ${attendanceList.length} student(s).`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to fetch student list.', 'error');
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = (index) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: !copy[index].status };
      return copy;
    });
  };

  const toggleSelectAll = (checked) => {
    setStudents(prev => prev.map(s => ({ ...s, status: checked })));
  };

  const saveAttendance = async () => {
    if (!subject.trim()) {
      addToast('Please specify the Subject Name before saving.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await api.post('/attendance/bulk', {
        records: students.map(s => ({
          name: s.name,
          roll: s.roll,
          department: s.department,
          year: s.year,
          date: s.date,
          subject: subject.trim(),
          status: s.status ? 'Present' : 'Absent'
        }))
      });

      addToast('Attendance logs stored successfully!', 'success');
      // Reset state
      setShowTable(false);
      setStudents([]);
      setSubject('');
      setForm({
        department: '',
        year: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to submit attendance records.', 'error');
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

  // Check if all are selected
  const allSelected = students.length > 0 && students.every(s => s.status);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <CheckSquare size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">Mark Daily Attendance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Filter by class details, date, and register student presence status.</p>
        </div>
      </div>

      {/* Class Filters Panel */}
      {!showTable && (
        <Card className="glass-card shadow-lg max-w-2xl">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2 font-bold text-gray-750 dark:text-slate-200 text-sm">
              <ListFilter size={16} />
              Class Filters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department"
                type="select"
                options={departments}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />

              <Input
                label="Academic Year"
                type="select"
                options={years}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <Input
              label="Attendance Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              loading={loading}
            >
              Load Student Registry
            </Button>
          </form>
        </Card>
      )}

      {/* Attendance Table Panel */}
      {showTable && students.length > 0 && (
        <Card className="glass-card shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 dark:text-white text-base">
                Attendance Registry List
              </h3>
              <p className="text-xs text-gray-550">
                Class: <strong className="text-indigo-600 dark:text-indigo-400">{form.department} {form.year} Year</strong> | Date:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">{form.date}</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setShowTable(false);
                setStudents([]);
              }}
              className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-lg"
            >
              Change Filters
            </button>
          </div>

          {/* Subject Field Input */}
          <div className="max-w-md">
            <Input
              label="Subject Name"
              type="text"
              placeholder="e.g. Computer Science, Financial Accounting"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Student Presence Check Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-150 dark:border-slate-750 font-semibold text-gray-700 dark:text-gray-300">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span>Presence Status</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {students.map((s, idx) => (
                  <tr
                    key={s.roll}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-semibold text-gray-800 dark:text-slate-200">
                      {s.name}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs">{s.roll}</td>
                    <td className="px-6 py-3.5">{s.date}</td>
                    <td className="px-6 py-3.5 font-medium text-indigo-500 dark:text-indigo-400">
                      {subject.trim() || '--'}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={s.status}
                          onChange={() => toggleStudentStatus(idx)}
                          className="sr-only"
                        />
                        <div className={`w-20 py-1.5 rounded-lg text-xs font-bold transition-all border ${s.status
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-400'
                          : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-400'
                          }`}>
                          {s.status ? 'Present' : 'Absent'}
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submission Panel */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={saveAttendance}
              variant="success"
              className="px-6 py-2.5"
              loading={loading}
              disabled={!subject.trim() || students.length === 0}
            >
              Save Attendance Record
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;
