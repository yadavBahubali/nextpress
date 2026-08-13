"use client";

import React, { useState, useEffect } from "react"; 
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const adminPath = params.admin as string || "admin";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (rememberMe) {
        localStorage.setItem("admin_remember_email", email);
      } else {
        localStorage.removeItem("admin_remember_email");
      }

      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Check for redirect parameter
        const redirectTo = searchParams.get("redirect");
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/${adminPath}/dashboard`);
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm border-0 p-4" style={{ width: "400px" }}>
        <div className="text-center mb-4">
          <Image
            src="/nextpress.png"
            alt="NextPress"
            width={200}
            height={150}
            className="mb-3"
            unoptimized
          />
          <h4 className="fw-bold">Admin Login</h4>
          <p className="text-muted">Enter your credentials to access the CMS</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <label className="form-label small fw-semibold mb-0">Password</label>
            </div>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted px-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'transparent' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label small text-muted cursor-pointer" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
           
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
