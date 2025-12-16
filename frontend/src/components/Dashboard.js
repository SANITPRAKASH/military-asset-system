// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState(user?.base_id || '');
  const [selectedDate, setSelectedDate] = useState('2024-01-01');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [movementDetails, setMovementDetails] = useState(null);

  useEffect(() => {
    loadBases();
    loadMetrics();
  }, [selectedBase, selectedDate, selectedEquipment]);

  const loadBases = async () => {
    try {
      const response = await api.get('/bases');
      setBases(response.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBase) params.base_id = selectedBase;
      if (selectedDate) params.start_date = selectedDate;
      if (selectedEquipment) params.equipment_type = selectedEquipment;

      const response = await api.get('/dashboard/metrics', { params });
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNetMovementClick = async () => {
    try {
      const params = {};
      if (selectedBase) params.base_id = selectedBase;
      if (selectedDate) params.start_date = selectedDate;

      const response = await api.get('/dashboard/movement-details', { params });
      setMovementDetails(response.data);
      setShowDetailsPopup(true);
    } catch (error) {
      console.error('Failed to load movement details:', error);
      alert('Failed to load details');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      api.post('/auth/logout').catch(err => console.error(err));
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Animated Background Effects */}
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
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Military Asset Management</h1>
                <p className="text-sm text-emerald-400 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    Welcome, {user?.username} 
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => navigate('/purchases')} 
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
              >
                Purchases
              </button>
              <button 
                onClick={() => navigate('/transfers')} 
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
              >
                Transfers
              </button>
              <button 
                onClick={() => navigate('/assignments')} 
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
              >
                Assignments
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Filters Card */}
        <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user?.role === 'admin' && (
              <div className="flex flex-col">
                <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Base:</label>
                <div className="relative">
                  <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                  >
                    <option value="">All Bases</option>
                    {bases.map(base => (
                      <option key={base.base_id} value={base.base_id}>{base.base_name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col">
              <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Date From:</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white transition-all duration-200 hover:border-emerald-500/50 [color-scheme:dark]"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Equipment Type:</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  placeholder="Filter by type..."
                  className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 transition-all duration-200 hover:border-emerald-500/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
              
              {/* Middle rotating ring */}
              <div className="absolute top-2 left-2 w-28 h-28 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
              
              {/* Center icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              {/* Loading text */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-emerald-400 font-bold text-lg animate-pulse">Loading Metrics...</p>
                <div className="flex gap-1 justify-center mt-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white">Key Metrics</h2>
              </div>
              <span className="text-xs text-emerald-400 font-medium px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                REAL-TIME DATA
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Opening Balance', value: metrics?.opening_balance || 0, icon: '📊' },
                { label: 'Closing Balance', value: metrics?.closing_balance || 0, icon: '💰' },
                { label: 'Net Movement', value: metrics?.net_movement || 0, clickable: true, icon: '🔄' },
                { label: 'Purchases', value: metrics?.purchases || 0, positive: true, icon: '🛒' },
                { label: 'Transfers In', value: metrics?.transfers_in || 0, positive: true, icon: '📥' },
                { label: 'Transfers Out', value: metrics?.transfers_out || 0, negative: true, icon: '📤' },
                { label: 'Assigned Assets', value: metrics?.assigned_assets || 0, icon: '✅' },
                { label: 'Expended', value: metrics?.expended || 0, negative: true, icon: '❌' },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className={`relative group p-5 rounded-xl bg-gradient-to-br from-[#0a0e1a] to-[#111827] border border-emerald-500/20 hover:border-emerald-500 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${m.clickable ? 'cursor-pointer' : ''}`}
                  onClick={m.clickable ? handleNetMovementClick : undefined}
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icon Badge */}
                  <div className="absolute top-3 right-3 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {m.icon}
                  </div>
                  
                  <div className="relative">
                    <div className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                      {m.label}
                      {m.clickable && (
                        <span className="block text-[10px] text-cyan-400 italic mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          ▸ Click for details
                        </span>
                      )}
                    </div>
                    <div className={`text-3xl font-black mb-1 ${
                      m.positive ? 'text-emerald-400' : 
                      m.negative ? 'text-red-400' : 
                      'text-white'
                    }`}>
                      {m.negative && m.value > 0 ? '-' : m.positive ? '+' : ''}{m.value}
                    </div>
                    
                    {/* Indicator Bar */}
                    <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.positive ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          m.negative ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          'bg-gradient-to-r from-cyan-500 to-cyan-400'
                        }`}
                        style={{width: `${Math.min((Math.abs(m.value) / 100) * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {showDetailsPopup && movementDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-auto"
          onClick={() => setShowDetailsPopup(false)}
        >
          <div
            className="bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl p-6 md:p-8 max-w-6xl w-full relative shadow-2xl border border-emerald-500/30 overflow-auto max-h-[90vh] my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsPopup(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 flex items-center justify-center transition-all duration-200 hover:rotate-90 group z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-8 pr-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Movement Details</h2>
              </div>
              <p className="text-sm text-gray-400 ml-13">Comprehensive breakdown of asset movements</p>
            </div>

            {/* Movement Details Tables */}
            <div className="space-y-6">
              {['purchases', 'transfers_in', 'transfers_out'].map((type) => (
                <div key={type} className="bg-[#0a0e1a] rounded-xl p-5 border border-emerald-500/20">
                  <h3 className="text-emerald-400 font-bold mb-4 capitalize flex items-center gap-2 text-lg flex-wrap">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    {type.replace('_', ' ')} 
                    <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold">
                      {movementDetails[type]?.length || 0} Records
                    </span>
                  </h3>
                  
                  {movementDetails[type]?.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-emerald-500/20">
                      <table className="min-w-full divide-y divide-emerald-500/20">
                        <thead className="bg-emerald-500/5">
                          <tr>
                            {Object.keys(movementDetails[type][0]).map((key) => (
                              <th key={key} className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">
                                {key.replace(/_/g, ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-500/10">
                          {movementDetails[type].map((item, idx) => (
                            <tr key={idx} className="hover:bg-emerald-500/5 transition-colors duration-150">
                              {Object.keys(item).map((key) => (
                                <td key={key} className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                                  {key.includes('date') ? new Date(item[key]).toLocaleDateString() : item[key] || 'N/A'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic border border-dashed border-emerald-500/20 rounded-lg">
                      No {type.replace(/_/g, ' ')} in this period
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        /* Custom date input styling for dark theme */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;