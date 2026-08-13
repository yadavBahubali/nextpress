"use client";
import React, { useEffect, useState } from "react";
import { FaChartLine, FaInbox, FaPercent } from "react-icons/fa";
import { reportsService } from "@/services/reports.service";

export default function SalesBlock() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    reportsService.getSalesDashboard().then(res => {
      if (res.status === "success") setData(res.data);
    }).catch(() => {});
  }, []);

  const kpis = data?.kpis || { totalLeads: 0, wonLeads: 0, conversionRate: 0 };
  const byStatus = data?.charts?.byStatus || [];

  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex align-items-center mb-4 gap-2">
        <div className="bg-success bg-opacity-10 text-success p-2 rounded"><FaChartLine /></div>
        <h5 className="fw-bold mb-0">Sales & Leads</h5>
      </div>
      
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Total Leads</div>
            <div className="fs-4 fw-bold">{kpis.totalLeads}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Won Leads</div>
            <div className="fs-4 fw-bold text-success">{kpis.wonLeads}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Conversion Rate</div>
            <div className="fs-4 fw-bold text-primary">{kpis.conversionRate}%</div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        {byStatus.map((s: any) => (
          <span key={s.sales_status} className="badge bg-secondary">
            {s.sales_status || 'New'}: {s.count}
          </span>
        ))}
      </div>
    </div>
  );
}
