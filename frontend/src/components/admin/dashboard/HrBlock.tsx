"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSuitcase } from "react-icons/fa";
import { reportsService } from "@/services/reports.service";

export default function HrBlock() {
  const [data, setData] = useState({ activeJobs: 0, newApplicants: 0 });

  useEffect(() => {
    reportsService.getHrDashboard().then(res => {
      if (res.status === 'success') {
        setData(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex align-items-center mb-4 gap-2">
        <div className="bg-warning bg-opacity-10 text-warning p-2 rounded"><FaSuitcase /></div>
        <h5 className="fw-bold mb-0">HR & Careers</h5>
      </div>
      
      <div className="row g-3">
        <div className="col-md-6">
          <div className="p-3 bg-light rounded border text-center">
            <FaSuitcase className="text-muted mb-2 fs-4" />
            <div className="text-muted small">Active Jobs</div>
            <div className="fs-4 fw-bold">{data.activeJobs}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 bg-light rounded border text-center">
            <FaUsers className="text-muted mb-2 fs-4" />
            <div className="text-muted small">New Applicants</div>
            <div className="fs-4 fw-bold text-success">{data.newApplicants}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
