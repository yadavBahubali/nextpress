"use client";

import React, { useState, useEffect } from "react";
import { FaBriefcase, FaUsers, FaCheckCircle, FaUserTie, FaChartPie } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import careersService from "@/services/careers.service";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  new: '#0d6efd', // Primary
  reviewed: '#0dcaf0', // Info
  interviewing: '#ffc107', // Warning
  offered: '#20c997', // Teal
  hired: '#198754', // Success
  rejected: '#dc3545', // Danger
};

export default function HRDashboard() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await careersService.getHrDashboard();
        setData(stats);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load HR dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error || "No data available"}</div>
      </div>
    );
  }

  // Format data for Pie Chart
  const pieData = (data.statusBreakdown || []).map((item: any) => ({
    name: item.status.replace('_', ' '),
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6c757d'
  }));

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">HR & Careers Dashboard</h2>
          <p className="text-muted mb-0">Overview of job postings and candidate pipelines.</p>
        </div>
        <div className="d-flex gap-2">
            <Link href={`/${adminPath}/hr/jobs/create`} className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 shadow-sm">
              <FaBriefcase /> Post Job
            </Link>
            <Link href={`/${adminPath}/hr/applications`} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
              <FaUsers /> View ATS
            </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Active Jobs</h6>
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                <FaBriefcase size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.jobs.active}</h2>
            <small className="text-muted mt-2">{data.jobs.total} Total Job Postings</small>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaBriefcase size={100} />
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Applicants</h6>
              <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                <FaUsers size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.applications.total}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaUsers size={100} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>New Applicants (30d)</h6>
              <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                <FaUserTie size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.applications.recent30Days}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaUserTie size={100} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Hired</h6>
              <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                <FaCheckCircle size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-success">{data.applications.hired}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaCheckCircle size={100} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Applicants */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaUserTie className="text-primary" /> 
                  Recent Applicants
              </h5>
              <Link href={`/${adminPath}/hr/applications`} className="btn btn-sm btn-light border">View All</Link>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2 px-3">Applicant Name</th>
                    <th className="py-2">Position Applied</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-end px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications && data.recentApplications.length > 0 ? (
                    data.recentApplications.map((app: any) => (
                      <tr key={app.id}>
                        <td className="py-3 px-3 fw-medium">{app.name}</td>
                        <td className="py-3 text-muted">{app.job_title}</td>
                        <td className="py-3">
                           <span className="badge text-capitalize" style={{ backgroundColor: STATUS_COLORS[app.status] || '#6c757d' }}>
                             {app.status.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="py-3 text-end px-3 text-muted small">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">No recent applicants.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ATS Pipeline Breakdown */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FaChartPie className="text-primary" /> 
                Pipeline Distribution
            </h5>
            
            {/* Recharts Pie Chart */}
            <div className="d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`${value} Applicants`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-muted small">No pipeline data</span>
              )}
            </div>

            {/* Custom Legend */}
            <div className="d-flex flex-column gap-2 mt-3 px-2">
              {pieData.map((entry: any, index: number) => (
                  <div key={index} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }}></div>
                        <span className="small text-capitalize text-secondary fw-medium">{entry.name}</span>
                      </div>
                      <span className="small fw-bold text-dark">{entry.value}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
