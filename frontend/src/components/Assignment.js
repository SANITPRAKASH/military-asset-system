// ============================================
// ASSIGNMENTS.JS - Enhanced Version
// ============================================
// src/components/Assignments.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Assignments({ user, onLogout }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    asset_id: '',
    assigned_to: '',
    personnel_id: '',
    assignment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      alert('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assigned_to || !formData.assignment_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const assignmentData = {
        asset_id: 1,
        assigned_to: formData.assigned_to,
        personnel_id: formData.personnel_id,
        assignment_date: formData.assignment_date,
        notes: formData.notes
      };

      await api.post('/assignments', assignmentData);
      alert('Assignment created successfully!');
      setShowForm(false);
      setFormData({
        asset_id: '',
        assigned_to: '',
        personnel_id: '',
        assignment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleReturn = async (assignmentId) => {
    if (!window.confirm('Mark this asset as returned?')) return;
    try {
      await api.put(`/assignments/${assignmentId}/return`);
      alert('Asset marked as returned!');
      loadAssignments();
    } catch (error) {
      console.error('Failed to return asset:', error);
      alert(error.response?.data?.error || 'Failed to process return');
    }
  };

  const canCreateAssignment = user?.role === 'admin' || user?.role === 'base_commander';

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwgMTg1LCAxMjksIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#111827] to-[#1f2937] border-b border-emerald-500/20 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Assignment Management</h1>
                <p className="text-sm text-emerald-400 font-medium">Assign assets to personnel and track expenditures</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Dashboard
              </button>
              <button onClick={() => navigate('/purchases')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Purchases
              </button>
              <button onClick={() => navigate('/transfers')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Transfers
              </button>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Action Button */}
        {canCreateAssignment && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-lg ${
              showForm
                ? "bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
            }`}
          >
            {showForm ? '✕ Cancel' : '+ New Assignment'}
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Create New Assignment</h2>
            </div>
            
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Assigned To (Name): *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleFormChange}
                      placeholder="Personnel name"
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Personnel ID:</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="personnel_id"
                      value={formData.personnel_id}
                      onChange={handleFormChange}
                      placeholder="Optional ID number"
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Assignment Date: *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="assignment_date"
                      value={formData.assignment_date}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white transition-all duration-200 hover:border-emerald-500/50 [color-scheme:dark]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Notes:</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Assignment details, purpose, etc..."
                    className="px-4 py-2.5 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 resize-y transition-all duration-200 hover:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={handleSubmit} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
                  Create Assignment
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-bold transition-all duration-200">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Table */}
        <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Assignment History</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                <div className="absolute top-2 left-2 w-28 h-28 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-emerald-400 font-bold text-lg animate-pulse">Loading Assignments...</p>
                  <div className="flex gap-1 justify-center mt-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-emerald-500/30 rounded-xl">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 italic">No assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-emerald-500/20">
              <table className="min-w-full divide-y divide-emerald-500/20">
                <thead className="bg-emerald-500/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Assignment Date</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Equipment</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Assigned To</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Personnel ID</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Base</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Return Date</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {assignments.map(assignment => (
                    <tr key={assignment.assignment_id} className="hover:bg-emerald-500/5 transition-colors duration-150">
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{new Date(assignment.assignment_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{assignment.type_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{assignment.category}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{assignment.assigned_to}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{assignment.personnel_id || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{assignment.base_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          assignment.status === 'active' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          assignment.status === 'returned' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                        {assignment.return_date ? new Date(assignment.return_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {assignment.status === 'active' && canCreateAssignment && (
                            <button
                              onClick={() => handleReturn(assignment.assignment_id)}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                            >
                              ✓ Mark Returned
                            </button>
                          )}
                          {assignment.status === 'returned' && <span className="text-emerald-400 font-bold text-sm">✓ Returned</span>}
                          {assignment.status === 'lost' && <span className="text-red-400 font-bold text-sm">✗ Lost</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Assignments;