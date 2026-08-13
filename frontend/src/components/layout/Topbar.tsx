"use client";
import React, { useState, useEffect } from "react";
import { FaUserCircle, FaBell, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { reportsService } from "@/services/reports.service";
import { useRouter, useParams } from "next/navigation";

const Topbar = () => {
  const { user, logout: clearStore } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const adminPath = params.admin as string || "admin";

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const response = await reportsService.getNotifications();
      if (response?.status === 'success' && response?.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = () => {
    setUnreadCount(0); // Clear badge on open
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearStore();
      router.push(`/${adminPath}/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      clearStore();
      router.push(`/${adminPath}/login`);
    }
  };

  return (
    <div className="bg-white border-bottom py-2 px-4 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1000 }}>
      <div className="input-group w-25">
        <span className="input-group-text bg-transparent ">
          <FaSearch className="text-muted" />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search something..."
        />
      </div>
      <div className="d-flex align-items-center gap-4">
        <div className="dropdown">
          <div 
            className="position-relative cursor-pointer" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            onClick={handleOpenNotifications}
          >
            <FaBell className="fs-5 text-muted hover-text-primary transition-all" />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "8px", padding: "3px 5px" }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 p-0" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
            <li className="p-3 border-bottom bg-light rounded-top">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold small">Notifications</span>
                <span className="badge bg-primary bg-opacity-10 text-primary small" style={{ fontSize: '10px' }}>{notifications.length} Total</span>
              </div>
            </li>
            <div className="scrollbar-thin" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <li className="p-4 text-center text-muted small">No new notifications</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id} className="border-bottom hover-bg-light transition-all list-unstyled">
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className={`badge ${
                          n.type === 'blog_created' ? 'bg-success bg-opacity-10 text-success' :
                          n.type === 'blog_updated' ? 'bg-warning bg-opacity-10 text-warning' :
                          'bg-info bg-opacity-10 text-info'
                        } text-uppercase`} style={{ fontSize: '8px' }}>
                          {n.type.replace('_', ' ')}
                        </span>
                        <span className="text-muted" style={{ fontSize: '9px' }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mb-0 text-dark fw-medium" style={{ fontSize: '12px', lineHeight: '1.4' }}>{n.message}</p>
                    </div>
                  </li>
                ))
              )}
            </div>
          </ul>
        </div>
        <div className="dropdown">
          <div 
            className="d-flex align-items-center gap-2 cursor-pointer dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span
              className="fw-semibold text-truncate"
              style={{ maxWidth: "150px" }}
            >
              {user?.email || "Administrator"}
            </span>
            <FaUserCircle className="fs-3 text-primary" />
          </div>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li>
              <div className="dropdown-item py-2 border-bottom d-flex align-items-center gap-2">
                <div>
                  <div className="fw-bold small">{user?.name || "Admin"}</div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>{user?.email}</div>
                  <div className="badge bg-primary bg-opacity-10 text-primary mt-1" style={{ fontSize: "10px" }}>
                    {user?.role_id === 1 ? 'Super Admin' : 
                     user?.role_id === 2 ? 'Admin' : 
                     user?.role_id === 3 ? 'Editor' : 'Viewer'}
                  </div>
                </div>
              </div>
            </li>
            <li><a className="dropdown-item py-2 small" href="#">Profile Settings</a></li>
            <li>
              <button 
                className="dropdown-item py-2 small text-danger d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

