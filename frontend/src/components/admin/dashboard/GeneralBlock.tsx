"use client";
import React, { useEffect, useState } from "react";
import { FaFileAlt, FaThLarge, FaUsers } from "react-icons/fa";
import { reportsService } from "@/services/reports.service";

export default function GeneralBlock() {
  const [data, setData] = useState({ totalPages: 0, totalPosts: 0, totalUsers: 0 });

  useEffect(() => {
    reportsService.getGeneralDashboard().then(res => {
      if (res.status === 'success') {
        setData(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex align-items-center mb-4 gap-2">
        <div className="bg-info bg-opacity-10 text-info p-2 rounded"><FaFileAlt /></div>
        <h5 className="fw-bold mb-0">Content Overview</h5>
      </div>
      
      <div className="row g-3">
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border d-flex align-items-center gap-3">
            <FaFileAlt className="text-primary fs-3" />
            <div>
              <div className="text-muted small">Pages</div>
              <div className="fs-5 fw-bold">{data.totalPages}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border d-flex align-items-center gap-3">
            <FaThLarge className="text-success fs-3" />
            <div>
              <div className="text-muted small">Blog Posts</div>
              <div className="fs-5 fw-bold">{data.totalPosts}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-light rounded border d-flex align-items-center gap-3">
            <FaUsers className="text-warning fs-3" />
            <div>
              <div className="text-muted small">Users</div>
              <div className="fs-5 fw-bold">{data.totalUsers}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
