"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCircle, FaEnvelope, FaCalendarAlt, FaHistory, FaFilter } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCustomers } from "@/store/slices/ecommerceSlice";
import { Customer } from "@/services/ecommerce.service";

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useAppSelector((state) => state.ecommerce);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Customer Management</h2>
          <p className="text-muted">Review and manage your customer database.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom">
            <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text bg-transparent border-end-0"><FaSearch className="text-muted"/></span>
                <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="py-3">Contact</th>
                <th className="py-3 text-center">Orders</th>
                <th className="py-3 text-end">Total Spent</th>
                <th className="py-3 px-4 text-end">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-5">Loading customers...</td></tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-light rounded-circle p-2 text-primary">
                                <FaUserCircle size={24}/>
                            </div>
                            <div className="fw-bold text-dark">{c.name}</div>
                        </div>
                    </td>
                    <td className="py-3 small text-muted">
                        <div className="d-flex align-items-center gap-2">
                            <FaEnvelope size={12}/> {c.email}
                        </div>
                    </td>
                    <td className="py-3 text-center">
                        <span className="badge bg-light text-dark border rounded-pill px-3">
                            {c.total_orders}
                        </span>
                    </td>
                    <td className="py-3 text-end fw-bold text-dark">
                        ₹{parseFloat(String(c.total_spent || 0)).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-end text-muted small">
                        {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
