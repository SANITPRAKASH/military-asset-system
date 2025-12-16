// src/components/Purchases.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Purchases({ user, onLogout }) {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    base_id: user?.role === "admin" ? "" : user?.base_id,
    start_date: "",
    end_date: "",
    equipment_type: "",
  });

  const [formData, setFormData] = useState({
    base_id: user?.base_id || "",
    equipment_type_id: "",
    quantity: "",
    purchase_date: new Date().toISOString().split("T")[0],
    unit_cost: "",
    vendor: "",
    notes: "",
  });

  useEffect(() => {
    loadBases();
    loadEquipmentTypes();
    loadPurchases();
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [filters]);

  const loadBases = async () => {
    try {
      const response = await api.get("/bases");
      setBases(response.data);
    } catch (error) {
      console.error("Failed to load bases:", error);
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      const response = await api.get("/purchases/equipment/types");
      setEquipmentTypes(response.data);
    } catch (error) {
      console.error("Failed to load equipment types:", error);
    }
  };

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.base_id) params.base_id = filters.base_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.equipment_type)
        params.equipment_type = filters.equipment_type;

      const response = await api.get("/purchases", { params });
      setPurchases(response.data);
    } catch (error) {
      console.error("Failed to load purchases:", error);
      alert("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.base_id ||
      !formData.equipment_type_id ||
      !formData.quantity
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/purchases", {
        ...formData,
        quantity: parseInt(formData.quantity),
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
      });

      alert("Purchase created successfully!");
      setShowForm(false);
      setFormData({
        base_id: user?.base_id || "",
        equipment_type_id: "",
        quantity: "",
        purchase_date: new Date().toISOString().split("T")[0],
        unit_cost: "",
        vendor: "",
        notes: "",
      });
      loadPurchases();
    } catch (error) {
      console.error("Failed to create purchase:", error);
      alert(error.response?.data?.error || "Failed to create purchase");
    }
  };

  const canCreatePurchase =
    user?.role === "admin" || user?.role === "base_commander";

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Purchase Management</h1>
                <p className="text-sm text-emerald-400 font-medium">Record and track asset purchases</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Dashboard
              </button>
              <button onClick={() => navigate("/transfers")} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                Transfers
              </button>
              <button onClick={() => navigate("/assignments")} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5">
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
        {/* Filters */}
        <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 rounded-2xl shadow-xl border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {user?.role === "admin" && (
              <div className="flex flex-col">
                <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Base:</label>
                <div className="relative">
                  <select
                    name="base_id"
                    value={filters.base_id}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                  >
                    <option value="">All Bases</option>
                    {bases.map((base) => (
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
              <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Start Date:</label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
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
              <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">End Date:</label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
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
              <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Equipment Type:</label>
              <div className="relative">
                <input
                  type="text"
                  name="equipment_type"
                  value={filters.equipment_type}
                  onChange={handleFilterChange}
                  placeholder="Search equipment..."
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

        {/* Action Button */}
        {canCreatePurchase && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-lg ${
              showForm
                ? "bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
            }`}
          >
            {showForm ? "✕ Cancel" : "+ New Purchase"}
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
              <h2 className="text-lg font-bold text-white">Record New Purchase</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Base: *</label>
                  <div className="relative">
                    <select
                      name="base_id"
                      value={formData.base_id}
                      onChange={handleFormChange}
                      required
                      disabled={user?.role !== "admin"}
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                    >
                      <option value="">Select Base</option>
                      {bases.map((base) => (
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
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Equipment Type: *</label>
                  <div className="relative">
                    <select
                      name="equipment_type_id"
                      value={formData.equipment_type_id}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white appearance-none cursor-pointer transition-all duration-200 hover:border-emerald-500/50"
                    >
                      <option value="">Select Equipment</option>
                      {equipmentTypes.map((type) => (
                        <option key={type.type_id} value={type.type_id}>
                          {type.type_name} ({type.category})
                        </option>
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
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Quantity: *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      required
                      min="1"
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Purchase Date: *</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
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
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Unit Cost:</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="unit_cost"
                      value={formData.unit_cost}
                      onChange={handleFormChange}
                      step="0.01"
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Vendor:</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleFormChange}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 pr-10 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 transition-all duration-200 hover:border-emerald-500/50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-emerald-400 font-semibold mb-2 text-xs uppercase tracking-wider">Notes:</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Additional information..."
                    className="w-full px-4 py-2.5 bg-[#0a0e1a] border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white placeholder-gray-500 resize-y transition-all duration-200 hover:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
                >
                  Create Purchase
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-bold transition-all duration-200"
                >
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
            <h2 className="text-lg font-bold text-white">Purchase History</h2>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                
                {/* Loading text */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-emerald-400 font-bold text-lg animate-pulse">Loading Purchases...</p>
                  <div className="flex gap-1 justify-center mt-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-emerald-500/30 rounded-xl">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 italic">No purchases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-emerald-500/20">
              <table className="min-w-full divide-y divide-emerald-500/20">
                <thead className="bg-emerald-500/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Base</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Equipment</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Quantity</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Unit Cost</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Total Cost</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Vendor</th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {purchases.map((purchase) => (
                    <tr key={purchase.purchase_id} className="hover:bg-emerald-500/5 transition-colors duration-150">
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{purchase.base_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{purchase.type_name}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{purchase.category}</td>
                      <td className="px-4 py-3 text-emerald-400 text-sm font-semibold whitespace-nowrap">{purchase.quantity}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                        ${purchase.unit_cost != null ? Number(purchase.unit_cost).toFixed(2) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 text-sm font-semibold whitespace-nowrap">
                        ${purchase.total_cost != null ? Number(purchase.total_cost).toFixed(2) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{purchase.vendor || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{purchase.created_by_name || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Custom date input styling for dark theme */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Purchases;