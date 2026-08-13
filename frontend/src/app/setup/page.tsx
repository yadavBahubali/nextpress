"use client";

import React, { useState, useEffect } from "react";
import { setupService } from "@/services/setup.service";
import { toast } from "react-hot-toast";

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [dbConfig, setDbConfig] = useState({
    db_host: "localhost",
    db_user: "root",
    db_password: "",
    db_name: "delta_aiciitd",
  });
  const [siteData, setSiteData] = useState({
    site_title: "",
    search_engine_visibility: false,
  });
  const [adminData, setAdminData] = useState({
    name: "Super Admin",
    email: "admin@example.com",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const res = await setupService.getStatus();
    if (res.status === "success") {
      setStatus(res.data);
    }
  };

  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbConfig({ ...dbConfig, [e.target.name]: e.target.value });
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteData({ 
      ...siteData, 
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value 
    });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await setupService.testConnection(dbConfig);
      if (res.status === "success") {
        toast.success("Database connection successful!");
        setStep(2);
      } else {
        toast.error(res.message || "Connection failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const startInstall = async () => {
    if (!siteData.site_title) {
      return toast.error("Site title is required");
    }
    if (adminData.password !== adminData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (adminData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const res = await setupService.install({
        db_config: dbConfig,
        admin_data: {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
        },
        site_data: {
          site_title: siteData.site_title,
          // If checkbox is checked, it means they WANT search engine visibility disabled (like WP)
          // Actually, let's just pass the boolean. 
          // If checked (true) -> we want to discourage -> noindex, nofollow -> meaning visibility = false
          search_engine_visibility: !siteData.search_engine_visibility
        }
      });

      if (res.status === "success") {
        toast.success("Installation complete!");
        setStep(4);
      } else {
        toast.error(res.message || "Installation failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Installation failed");
    } finally {
      setLoading(false);
    }
  };

  if (status?.isInstalled) {
    return (
      <div className="container mt-5 text-center">
        <div className="card p-5 shadow-lg border-0">
          <h2 className="text-success mb-4">Application Already Installed</h2>
          <p className="lead">The CMS is already configured and ready to use.</p>
          <div className="mt-4">
            <a href="/admin/login" className="btn btn-primary btn-lg">Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5 bg-light" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white p-5 text-center border-0">
                <div className="mb-3 bg-white p-2 rounded d-inline-block">
                  <img src="/nextpress.png" alt="NextPress" height="40" />
                </div>
                <h1 className="h3 mb-2 fw-bold">Platform Setup Wizard</h1>
                <p className="mb-0 opacity-75">Configure your independent CMS platform</p>
              </div>
              <div className="card-body p-4 p-md-5 bg-white">
              
              {/* Steps Progress */}
              <div className="d-flex justify-content-between mb-5 position-relative">
                <div className="setup-progress-line"></div>
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="text-center position-relative z-1" style={{ flex: 1 }}>
                    <div className={`setup-step-circle ${step >= s ? "bg-primary text-white" : "bg-light text-muted"}`}>
                      {s}
                    </div>
                    <div className="small mt-2 font-weight-bold">
                      {s === 1 ? "Database" : s === 2 ? "Site Details" : s === 3 ? "Admin" : "Finish"}
                    </div>
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="animate-in">
                  <h4 className="mb-4">Step 1: Database Configuration</h4>
                  <div className="mb-3">
                    <label className="form-label">Database Host</label>
                    <input type="text" name="db_host" className="form-control form-control-lg" value={dbConfig.db_host} onChange={handleDbChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Database Username</label>
                    <input type="text" name="db_user" className="form-control form-control-lg" value={dbConfig.db_user} onChange={handleDbChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Database Password</label>
                    <input type="password" name="db_password" className="form-control form-control-lg" value={dbConfig.db_password} onChange={handleDbChange} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Database Name</label>
                    <input type="text" name="db_name" className="form-control form-control-lg" value={dbConfig.db_name} onChange={handleDbChange} />
                  </div>
                  <button className="btn btn-primary btn-lg w-100" onClick={testConnection} disabled={loading}>
                    {loading ? "Testing Connection..." : "Test & Continue"}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in">
                  <h4 className="mb-4">Step 2: Site Details</h4>
                  <div className="mb-4">
                    <label className="form-label">Site Title</label>
                    <input 
                      type="text" 
                      name="site_title" 
                      className="form-control form-control-lg" 
                      placeholder="e.g. My NextPress Blog" 
                      value={siteData.site_title} 
                      onChange={handleSiteChange} 
                    />
                  </div>
                  
                  <div className="mb-4 form-check form-switch p-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center">
                      <input 
                        className="form-check-input ms-0 mt-0 me-3" 
                        type="checkbox" 
                        id="search_engine_visibility" 
                        name="search_engine_visibility" 
                        checked={siteData.search_engine_visibility} 
                        onChange={handleSiteChange} 
                        style={{ transform: 'scale(1.5)' }} 
                      />
                      <div>
                        <label className="form-check-label fw-bold mb-1" htmlFor="search_engine_visibility">
                          Discourage search engines from indexing this site
                        </label>
                        <div className="form-text mt-0">It is up to search engines to honor this request.</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-lg" onClick={() => setStep(1)} disabled={loading}>Back</button>
                    <button className="btn btn-primary btn-lg flex-grow-1 fw-bold" onClick={() => {
                      if (!siteData.site_title) return toast.error("Site title is required");
                      setStep(3);
                    }} disabled={loading}>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in">
                  <h4 className="mb-4">Step 3: Super Admin Account</h4>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" className="form-control form-control-lg" value={adminData.name} onChange={handleAdminChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" className="form-control form-control-lg" value={adminData.email} onChange={handleAdminChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control form-control-lg" value={adminData.password} onChange={handleAdminChange} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" className="form-control form-control-lg" value={adminData.confirmPassword} onChange={handleAdminChange} />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-lg" onClick={() => setStep(2)} disabled={loading}>Back</button>
                    <button className="btn btn-primary btn-lg flex-grow-1 fw-bold" onClick={startInstall} disabled={loading}>
                      {loading ? "Installing Platform..." : "Complete Installation"}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center animate-in">
                  <div className="mb-4">
                    <div className="display-1 text-success">✓</div>
                  </div>
                  <h3 className="mb-3">Installation Successful!</h3>
                  <p className="text-muted mb-4 px-md-4">
                    The platform has been successfully installed and configured. 
                    <br /><br />
                    <div className="alert alert-info text-start">
                      <strong>Note:</strong> You must restart your backend server process (e.g., PM2) for the changes to take effect.
                    </div>
                  </p>
                  <a href="/admin/login" className="btn btn-primary btn-lg px-5">Go to Dashboard</a>
                </div>
              )}

            </div>
          </div>

          <style jsx>{`
            .setup-step-circle {
              width: 45px;
              height: 45px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 1.1rem;
              margin: 0 auto;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              transition: all 0.3s ease;
            }
            .setup-progress-line {
              position: absolute;
              top: 22px;
              left: 10%;
              right: 10%;
              height: 3px;
              background: #e9ecef;
              z-index: 0;
              border-radius: 3px;
            }
            .animate-in {
              animation: fadeIn 0.4s ease-out forwards;
            }
            .form-control-lg {
              border-radius: 0.5rem;
              padding: 0.75rem 1rem;
              font-size: 1rem;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
            }
            .form-control-lg:focus {
              background-color: #fff;
              box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
            }
            .form-label {
              font-weight: 500;
              color: #495057;
            }
            .btn-lg {
              border-radius: 0.5rem;
              padding: 0.75rem 1.5rem;
              font-weight: 600;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(15px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    </div>
  </div>
  );
}
