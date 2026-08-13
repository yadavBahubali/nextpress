"use client";
import React, { useEffect, useState } from "react";
import { FaBox, FaShoppingCart, FaChartLine, FaUsers } from "react-icons/fa";
import { reportsService } from "@/services/reports.service";

export default function EcommerceBlock() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    reportsService.getEcommerceDashboard().then(res => {
      if (res.status === "success") setData(res.data);
    }).catch(() => {});
  }, []);

  const kpis = data?.kpis || { totalRevenue: 0, totalOrders: 0 };
  const inventory = data?.inventory || { totalProducts: 0, lowStock: 0 };
  const topProducts = data?.charts?.topProducts || [];

  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex align-items-center mb-4 gap-2">
        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded"><FaShoppingCart /></div>
        <h5 className="fw-bold mb-0">Ecommerce Overview</h5>
      </div>
      
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Total Revenue</div>
            <div className="fs-4 fw-bold text-success">${Number(kpis.totalRevenue).toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Total Orders</div>
            <div className="fs-4 fw-bold">{kpis.totalOrders}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Products</div>
            <div className="fs-4 fw-bold">{inventory.totalProducts}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-light rounded border">
            <div className="text-muted small">Low Stock</div>
            <div className="fs-4 fw-bold text-danger">{inventory.lowStock}</div>
          </div>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Top Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 3).map((prod: any, i: number) => (
                <tr key={i}>
                  <td className="fw-semibold">{prod.title}</td>
                  <td>{prod.total_sold}</td>
                  <td className="text-success fw-bold">${Number(prod.total_revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
