import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { FileText, Download, Printer, Search, Calendar, Award } from 'lucide-react';

const Reports = () => {
  const { user, isStudent } = useAuth();
  const { addToast } = useToast();

  const [roll, setRoll] = useState('');
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState([]);
  const [overallSummary, setOverallSummary] = useState(null);
  
  const [filters, setFilters] = useState({
    subject: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-set roll if logged-in user is a student
  useEffect(() => {
    if (isStudent && user) {
      setRoll(user.roll);
    }
  }, [user, isStudent]);

  // Trigger auto search for students on load
  useEffect(() => {
    if (isStudent && roll) {
      fetchReport(roll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll]);

  const fetchReport = async (rollNumber) => {
    const targetRoll = (rollNumber || roll).trim().toUpperCase();
    if (!targetRoll) {
      addToast('Roll Number is required', 'warning');
      return;
    }

    try {
      setLoading(true);
      setSearched(false);
      setStudent(null);
      setRecords([]);
      setSubjectSummary([]);
      setOverallSummary(null);

      // 1. Fetch Student profile to verify
      const studentsRes = await api.get('/students');
      const foundStudent = studentsRes.data.find(s => s.roll.toUpperCase() === targetRoll);
      
      if (!foundStudent) {
        addToast('Student profile not found.', 'error');
        setLoading(false);
        return;
      }
      setStudent(foundStudent);

      // 2. Fetch all attendance logs
      const recordsRes = await api.get('/attendance/report', {
        params: {
          roll: targetRoll,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          subject: filters.subject || undefined,
        }
      });
      setRecords(recordsRes.data);

      // 3. Fetch summaries
      const summaryRes = await api.get(`/attendance/summary?roll=${targetRoll}`);
      setOverallSummary(summaryRes.data);

      const subjectSummaryRes = await api.get(`/attendance/subject-summary?roll=${targetRoll}`);
      setSubjectSummary(subjectSummaryRes.data);

      setSearched(true);
      addToast('Attendance report compiled successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to fetch attendance logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    const targetRoll = roll.trim().toUpperCase();
    if (!targetRoll) return;

    // Trigger backend download
    const query = new URLSearchParams({
      roll: targetRoll,
      format: format,
      subject: filters.subject || '',
      start_date: filters.startDate || '',
      end_date: filters.endDate || '',
    }).toString();

    // Axios download helper to request file blob
    api.get(`/attendance/export?${query}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const ext = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
        link.setAttribute('download', `attendance_report_${targetRoll}.${ext}`);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast(`Exported ${format.toUpperCase()} successfully`, 'success');
      })
      .catch((err) => {
        console.error(err);
        addToast('Export failed. Check connection.', 'error');
      });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FileText size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">Attendance Reports</h2>
          <p className="text-xs text-gray-550 mt-0.5">Generate, query, filter, and export classroom presence logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Filter Selection Panel */}
        <Card className="glass-card shadow-lg p-5 lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-gray-750 dark:text-slate-200 text-sm">
            <Search size={16} />
            Search Student & Filters
          </div>

          <div className="space-y-4">
            <Input
              label="Student Roll Number"
              type="text"
              placeholder="e.g. BCA-01"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              disabled={isStudent}
            />

            <Input
              label="Subject (Optional)"
              type="text"
              placeholder="e.g. Computer Science"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <Button
              onClick={() => fetchReport()}
              variant="primary"
              className="w-full py-2.5"
              loading={loading}
            >
              Compile Report
            </Button>
          </div>
        </Card>

        {/* Report Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center shadow flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500 font-medium">Compiling query records...</span>
            </div>
          )}

          {!loading && searched && student && (
            <>
              {/* Student Summary and Download Actions */}
              <Card
                title={`Report: ${student.name}`}
                subtitle={`Roll: ${student.roll} | Dept: ${student.department} | Year: ${student.year} Year`}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-all"
                    >
                      <Download size={12} />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-250 hover:bg-emerald-50 text-emerald-600 dark:border-slate-850 dark:hover:bg-emerald-950 dark:text-emerald-400 transition-all"
                    >
                      <Download size={12} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm transition-all"
                    >
                      <Printer size={12} />
                      PDF Report
                    </button>
                  </div>
                }
              >
                {/* Stats summary list */}
                {overallSummary && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-850 rounded-xl p-4 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total Days Held</p>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{overallSummary.total_days}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Present Days</p>
                      <h4 className="text-xl font-bold text-emerald-650 dark:text-emerald-400 mt-1">{overallSummary.present}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Absent Days</p>
                      <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{overallSummary.absent}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                        Presence Rate
                        <Award size={12} className="text-amber-500" />
                      </p>
                      <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{overallSummary.attendance_percentage}%</h4>
                    </div>
                  </div>
                )}

                {/* Subject breakdown table */}
                {subjectSummary.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-700 dark:text-slate-200">Attendance by Subject</h3>
                    <div className="overflow-x-auto border border-gray-100 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 font-semibold text-gray-700 dark:text-gray-300">
                            <th className="px-5 py-3">Subject Name</th>
                            <th className="px-5 py-3">Lectures Held</th>
                            <th className="px-5 py-3">Attended</th>
                            <th className="px-5 py-3">Missed</th>
                            <th className="px-5 py-3">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                          {subjectSummary.map((s, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                              <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-250">{s.subject}</td>
                              <td className="px-5 py-3">{s.total_days}</td>
                              <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">{s.present}</td>
                              <td className="px-5 py-3 text-rose-600 dark:text-rose-400">{s.absent}</td>
                              <td className={`px-5 py-3 font-bold ${
                                s.attendance_percentage >= 75
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : s.attendance_percentage >= 50
                                  ? 'text-amber-500'
                                  : 'text-rose-600 dark:text-rose-450'
                              }`}>
                                {s.attendance_percentage}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>

              {/* Detailed logs calendar list */}
              {records.length > 0 && (
                <Card title="Attendance History Logs">
                  <div className="overflow-x-auto border border-gray-100 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 font-semibold text-gray-700 dark:text-gray-300">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Register Timestamp</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                        {records.map((r, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            <td className="px-5 py-3 font-mono flex items-center gap-1.5">
                              <Calendar size={12} className="text-gray-400" />
                              {r.date}
                            </td>
                            <td className="px-5 py-3 text-slate-800 dark:text-slate-200">{r.subject}</td>
                            <td className="px-5 py-3 text-gray-400">{r.timestamp || '--'}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                r.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {!loading && searched && records.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center shadow font-medium text-gray-400">
              No matching attendance records found. Try modifying date ranges.
            </div>
          )}

          {!searched && !loading && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <FileText size={40} className="text-gray-300 dark:text-gray-700" />
              <span className="font-semibold text-sm">No Report Compiled Yet</span>
              <span className="text-xs text-gray-500">Provide a student roll number on the left to compile stats.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
