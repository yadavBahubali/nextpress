"use client";

import React, { useState, useEffect } from "react";
import { FaChartLine, FaUsers, FaCheckCircle, FaInbox, FaFunnelDollar, FaChartPie } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardData {
  kpis: {
    totalLeads: number;
    recentLeads30Days: number;
    wonLeads: number;
    conversionRate: number;
  };
  charts: {
    byForm: { title: string; count: number }[];
    byStatus: { sales_status: string; count: number }[];
    trend30Days: { date: string; count: number }[];
  };
}

const COLORS = {
  new: '#0d6efd',
  attempted_contact: '#ffc107',
  meeting_scheduled: '#0dcaf0',
  qualified: '#198754',
  won: '#20c997',
  lost: '#dc3545',
  default: '#6c757d'
};

export default function SalesDashboard() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/reports/sales-dashboard');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
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
  
  const getStatusColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || COLORS.default;
  };

  // Prepare Pie Chart Data
  const pieData = data.charts.byStatus.map(item => ({
    name: item.sales_status.replace('_', ' '),
    value: item.count,
    color: getStatusColor(item.sales_status)
  }));

  // Format dates for X-Axis (e.g., '2026-05-15' -> 'May 15')
  const formattedTrendData = data.charts.trend30Days.map(item => {
    const dateObj = new Date(item.date);
    return {
      ...item,
      displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Sales & Leads Dashboard</h2>
          <p className="text-muted mb-0">Overview of your CRM performance and incoming inquiries.</p>
        </div>
        <Link href={`/${adminPath}/forms/submissions`} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
          <FaInbox /> Lead Inbox
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Leads</h6>
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                <FaUsers size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.kpis.totalLeads}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaUsers size={100} />
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>New (30 Days)</h6>
              <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                <FaChartLine size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.kpis.recentLeads30Days}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaChartLine size={100} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Closed: Won</h6>
              <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                <FaCheckCircle size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-success">{data.kpis.wonLeads}</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaCheckCircle size={100} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 position-relative overflow-hidden rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Win Rate</h6>
              <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                <FaFunnelDollar size={20} />
              </div>
            </div>
            <h2 className="fw-bolder mb-0 display-5 text-dark">{data.kpis.conversionRate}%</h2>
            <div className="position-absolute" style={{ right: '-15px', bottom: '-20px', opacity: 0.05 }}>
              <FaFunnelDollar size={100} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recharts Area Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaChartLine className="text-primary" /> 
                  Lead Volume Trend
              </h5>
              <span className="badge bg-light text-dark border">Last 30 Days</span>
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              {formattedTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formattedTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6c757d' }} 
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6c757d' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#333' }}
                      formatter={(value: any) => [`${value} Leads`, 'Volume']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0d6efd" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLeads)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#0d6efd' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  No trend data available for the last 30 days.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Breakdown & Forms */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FaChartPie className="text-primary" /> 
                Pipeline Distribution
            </h5>
            
            {/* Recharts Pie Chart */}
            <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
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
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`${value} Leads`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-muted small">No pipeline data</span>
              )}
            </div>

            {/* Custom Legend */}
            <div className="d-flex flex-column gap-2 mt-2 px-2">
              {pieData.map((entry, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }}></div>
                        <span className="small text-capitalize text-secondary fw-medium">{entry.name}</span>
                      </div>
                      <span className="small fw-bold text-dark">{entry.value}</span>
                  </div>
              ))}
            </div>

            <hr className="my-4 border-light" />

            <div className="mt-2">
              <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Top Lead Sources</h6>
              <div className="d-flex flex-column gap-3">
                  {data.charts.byForm.map((form, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center">
                          <span className="small text-dark fw-medium">{form.title}</span>
                          <span className="badge bg-light text-dark border rounded-pill px-2">{form.count}</span>
                      </div>
                  ))}
                  {data.charts.byForm.length === 0 && (
                      <div className="text-muted small text-center py-2">No forms received leads yet.</div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
