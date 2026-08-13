"use client";

import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaRupeeSign, FaBoxOpen, FaExclamationTriangle, FaChartLine, FaArrowRight, FaBox } from "react-icons/fa";
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface EcommerceDashboardData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
  };
  charts: {
    salesTrend: { date: string; revenue: number; orders: number }[];
    orderStatus: { status: string; count: number }[];
    topProducts: { name: string; sales_count: number; total_revenue: number }[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ffc107',
  processing: '#0dcaf0',
  shipped: '#0d6efd',
  delivered: '#198754',
  cancelled: '#dc3545',
  refunded: '#6c757d',
};

export default function EcommerceDashboard() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  
  const [data, setData] = useState<EcommerceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/reports/ecommerce-dashboard');
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

  // Format trend data
  const trendData = data.charts.salesTrend.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Format Pie data
  const pieData = data.charts.orderStatus.map(item => ({
    name: item.status.replace('_', ' '),
    value: Number(item.count),
    color: STATUS_COLORS[item.status] || '#6c757d'
  }));

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Ecommerce Dashboard</h2>
          <p className="text-muted mb-0">At-a-glance overview of your shop's performance and inventory.</p>
        </div>
        <div className="d-flex gap-2">
            <Link href={`/${adminPath}/products/create`} className="btn btn-outline-primary px-4 rounded-3">
              Add Product
            </Link>
            <Link href={`/${adminPath}/orders`} className="btn btn-primary px-4 shadow-sm rounded-3">
              Manage Orders
            </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted fw-bold mb-0 small text-uppercase">Total Revenue</h6>
              <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                <FaRupeeSign size={16} />
              </div>
            </div>
            <h3 className="fw-bolder mb-1">₹{data.kpis.totalRevenue.toLocaleString()}</h3>
            <span className="text-muted small">Paid orders only</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted fw-bold mb-0 small text-uppercase">Total Orders</h6>
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                <FaShoppingCart size={16} />
              </div>
            </div>
            <h3 className="fw-bolder mb-1">{data.kpis.totalOrders}</h3>
            <span className="text-muted small">All order statuses</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted fw-bold mb-0 small text-uppercase">Avg Order Value</h6>
              <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">
                <FaChartLine size={16} />
              </div>
            </div>
            <h3 className="fw-bolder mb-1">₹{data.kpis.avgOrderValue}</h3>
            <span className="text-muted small">Average spend per user</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 rounded-4 bg-danger bg-opacity-10 border-danger border-opacity-25">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-danger fw-bold mb-0 small text-uppercase">Inventory Alerts</h6>
              <div className="bg-danger text-white p-2 rounded-3">
                <FaExclamationTriangle size={16} />
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 mt-2">
                <div>
                    <h4 className="fw-bold mb-0 text-danger">{data.inventory.lowStock}</h4>
                    <div className="text-danger small fw-semibold" style={{ fontSize: '0.65rem' }}>LOW STOCK</div>
                </div>
                <div className="vr opacity-25"></div>
                <div>
                    <h4 className="fw-bold mb-0 text-dark">{data.inventory.outOfStock}</h4>
                    <div className="text-muted small fw-semibold" style={{ fontSize: '0.65rem' }}>OUT OF STOCK</div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sales Chart */}
        <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Revenue Trend (30 Days)</h5>
                    <div className="text-muted small">Daily Sales Volume</div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} tickFormatter={(val) => `₹${val/1000}k`} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                                formatter={(val) => [`₹${val}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Order Status Pie */}
        <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                <h5 className="fw-bold mb-4">Order Status Breakdown</h5>
                <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                dataKey="value"
                                paddingAngle={4}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="d-flex flex-column gap-2 overflow-auto scrollbar-hidden">
                    {pieData.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center small">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }}></div>
                                <span className="text-capitalize text-muted fw-medium">{item.name}</span>
                            </div>
                            <span className="fw-bold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-lg-12">
            <div className="card border-0 shadow-sm p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Best Selling Products</h5>
                    <Link href={`/${adminPath}/products`} className="text-primary text-decoration-none small fw-bold">View Catalog <FaArrowRight size={10}/></Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3">Product Name</th>
                                <th className="text-center">Units Sold</th>
                                <th className="text-end pe-3">Revenue Contribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.charts.topProducts.length > 0 ? (
                                data.charts.topProducts.map((prod, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-3 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light p-2 rounded text-muted"><FaBox size={14}/></div>
                                                <div className="fw-bold">{prod.name}</div>
                                            </div>
                                        </td>
                                        <td className="text-center fw-semibold">{prod.sales_count}</td>
                                        <td className="text-end pe-3 text-success fw-bold">₹{Number(prod.total_revenue).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="text-center py-4 text-muted">No sales data yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
