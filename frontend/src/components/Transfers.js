// src/components/Transfers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Transfers({ user, onLogout }) {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    asset_id: '',
    from_base_id: user?.base_id || '',
    to_base_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    quantity: '1',
    reason: ''
  });

  useEffect(() => {
    loadBases();
    loadTransfers();
  }, []);

  useEffect(() => {
    if (formData.from_base_id) {
      loadAvailableAssets(formData.from_base_id);
    }
  }, [formData.from_base_id]);

  const loadBases = async () => {
    try {
      const response = await api.get('/bases');
      setBases(response.data);
    } catch (error) {
      console.error('Failed to load bases:', error);
    }
  };

  const loadAvailableAssets = async (baseId) => {
    try {
      const response = await api.get('/purchases');
      setAssets([]);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transfers');
      setTransfers(response.data);
    } catch (error) {
      console.error('Failed to load transfers:', error);
      alert('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from_base_id || !formData.to_base_id) {
      alert('Please select both source and destination bases');
      return;
    }

    if (formData.from_base_id === formData.to_base_id) {
      alert('Source and destination bases must be different');
      return;
    }

    try {
      const transferData = {
        asset_id: 1,
        from_base_id: parseInt(formData.from_base_id),
        to_base_id: parseInt(formData.to_base_id),
        transfer_date: formData.transfer_date,
        quantity: parseInt(formData.quantity),
        reason: formData.reason
      };

      await api.post('/transfers', transferData);

      alert('Transfer request created successfully!');
      setShowForm(false);
      setFormData({
        asset_id: '',
        from_base_id: user?.base_id || '',
        to_base_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        quantity: '1',
        reason: ''
      });
      loadTransfers();
    } catch (error) {
      console.error('Failed to create transfer:', error);
      alert(error.response?.data?.error || 'Failed to create transfer');
    }
  };

  const handleApprove = async (transferId) => {
    if (!window.confirm('Are you sure you want to approve this transfer?')) return;

    try {
      await api.put(`/transfers/${transferId}/approve`);
      alert('Transfer approved successfully!');
      loadTransfers();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
      alert(error.response?.data?.error || 'Failed to approve transfer');
    }
  };

  const handleCancel = async (transferId) => {
    if (!window.confirm('Are you sure you want to cancel this transfer?')) return;

    try {
      await api.put(`/transfers/${transferId}/cancel`);
      alert('Transfer cancelled successfully!');
      loadTransfers();
    } catch (error) {
      console.error('Failed to cancel transfer:', error);
      alert(error.response?.data?.error || 'Failed to cancel transfer');
    }
  };

  const canApprove = (transfer) => {
    return (user?.role === 'admin' || 
           (user?.role === 'base_commander' && transfer.to_base_id === user?.base_id)) &&
           transfer.status === 'pending';
  };

  const canCancel = (transfer) => transfer.status === 'pending';

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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Transfer Management</h1>
                <p className="text-sm text-emerald-400 font-medium">Manage asset transfers between bases</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Dashboard
              </button>
              <button onClick={() => navigate('/purchases')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Purchases
              </button>
              <button onClick={() => navigate('/assignments')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Assignments
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
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-lg ${
            showForm
              ? "bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
          }`}
        >
          {showForm ? '✕ Cancel' : '+ New Transfer'}
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Request Asset Transfer</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">From Base: *</label>
                  <div className="relative">
                    <select
                      name="from_base_id"
                      value={formData.from_base_id}
                      onChange={handleFormChange}
                      required
                      disabled={user?.role !== 'admin'}
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                    >
                      <option value="">Select Source Base</option>
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

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">To Base: *</label>
                  <div className="relative">
                    <select
                      name="to_base_id"
                      value={formData.to_base_id}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                    >
                      <option value="">Select Destination Base</option>
                      {bases.filter(b => b.base_id !== parseInt(formData.from_base_id)).map(base => (
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

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Transfer Date: *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="transfer_date"
                      value={formData.transfer_date}
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

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Quantity: *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      min="1"
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Reason:</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Reason for transfer..."
                    className="w-full px-4 py-2.5 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 resize-y transition-all duration-200 hover:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
                  Request Transfer
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-bold transition-all duration-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Transfer History</h2>
          </div>
          
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                
                {/* Loading text */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-emerald-400 font-bold text-lg animate-pulse">Loading Transfers...</p>
                  <div className="flex gap-1 justify-center mt-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-emerald-500/30 rounded-xl">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p className="text-gray-500 italic">No transfers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-emerald-500/20">
              <table className="min-w-full divide-y divide-emerald-500/20">
                <thead className="bg-emerald-500/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">From Base</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">To Base</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Equipment</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Quantity</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Requested By</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Approved By</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {transfers.map(transfer => (
                    <tr key={transfer.transfer_id} className="hover:bg-emerald-500/5 transition-colors duration-150">
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{transfer.from_base_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{transfer.to_base_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{transfer.type_name}</td>
                      <td className="px-4 py-3 text-emerald-400 text-sm font-semibold whitespace-nowrap">{transfer.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          transfer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          transfer.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          transfer.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{transfer.requested_by_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{transfer.approved_by_name || 'Pending'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          {canApprove(transfer) && (
                            <button
                              onClick={() => handleApprove(transfer.transfer_id)}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {canCancel(transfer) && (
                            <button
                              onClick={() => handleCancel(transfer.transfer_id)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500 text-red-400 rounded-lg text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                            >
                              ✕ Cancel
                            </button>
                          )}
                          {transfer.status === 'completed' && <span className="text-emerald-400 font-bold text-sm">✓ Complete</span>}
                          {transfer.status === 'cancelled' && <span className="text-red-400 font-bold text-sm">✗ Cancelled</span>}
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
    </div>
  );
}

export default Transfers;