"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMenuByLocation } from "@/store/slices/menuSlice";
import { fetchSettingsGroup } from "@/store/slices/settingsSlice";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const dispatch = useAppDispatch();
  const { menus } = useAppSelector((state) => state.menu);
  const { settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (!menus['footer_1']) dispatch(fetchMenuByLocation('footer_1'));
    if (!menus['footer_2']) dispatch(fetchMenuByLocation('footer_2'));
    dispatch(fetchSettingsGroup(['company_name', 'company_address', 'company_phone', 'company_email', 'social_facebook', 'social_x', 'social_linkedin', 'social_instagram']));
  }, [dispatch, menus]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light pt-5 pb-4 mt-auto border-top">
      <div className="container pt-4">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 mb-4 pe-lg-5">
            <Link href="/" className="d-inline-flex align-items-center gap-2 mb-3 fs-3 fw-bold text-primary text-decoration-none">
              <div className="bg-primary text-white rounded p-2 fs-5 lh-1">
                <i className="fa-solid fa-cube"></i>
              </div>
              <span>{settings?.company_name || 'My SaaS'}</span>
            </Link>
            <p className="text-muted mb-4">
              {settings?.company_address || 'Empowering your digital journey with scalable solutions, intuitive design, and seamless performance.'}
            </p>
            <div className="d-flex gap-3">
              {settings?.social_facebook && <a href={settings.social_facebook} className="btn btn-sm btn-outline-secondary rounded-circle"><FaFacebook /></a>}
              {settings?.social_x && <a href={settings.social_x} className="btn btn-sm btn-outline-secondary rounded-circle"><FaTwitter /></a>}
              {settings?.social_linkedin && <a href={settings.social_linkedin} className="btn btn-sm btn-outline-secondary rounded-circle"><FaLinkedin /></a>}
              {settings?.social_instagram && <a href={settings.social_instagram} className="btn btn-sm btn-outline-secondary rounded-circle"><FaInstagram /></a>}
            </div>
          </div>
          
          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="fw-bold mb-4">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {menus['footer_1']?.items?.map(item => (
                <li key={item.id}><Link href={item.url || '#'} className="text-decoration-none text-muted menu-hover-primary">{item.label}</Link></li>
              ))}
              {!menus['footer_1']?.items?.length && (
                <>
                  <li><Link href="/" className="text-decoration-none text-muted">Home</Link></li>
                  <li><Link href="/about" className="text-decoration-none text-muted">About Us</Link></li>
                  <li><Link href="/features" className="text-decoration-none text-muted">Features</Link></li>
                  <li><Link href="/pricing" className="text-decoration-none text-muted">Pricing</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="fw-bold mb-4">Support</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {menus['footer_2']?.items?.map(item => (
                <li key={item.id}><Link href={item.url || '#'} className="text-decoration-none text-muted menu-hover-primary">{item.label}</Link></li>
              ))}
              {!menus['footer_2']?.items?.length && (
                <>
                  <li><Link href="/contact" className="text-decoration-none text-muted">Contact Us</Link></li>
                  <li><Link href="/faq" className="text-decoration-none text-muted">FAQ</Link></li>
                  <li><Link href="/help" className="text-decoration-none text-muted">Help Center</Link></li>
                  <li><Link href="/terms" className="text-decoration-none text-muted">Terms of Service</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="col-lg-4 col-md-4 mb-4">
            <h5 className="fw-bold mb-4">Contact Info</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-muted mb-4">
              {settings?.company_email && <li><i className="fa-solid fa-envelope me-2 text-primary"></i> {settings.company_email}</li>}
              {settings?.company_phone && <li><i className="fa-solid fa-phone me-2 text-primary"></i> {settings.company_phone}</li>}
              {!settings?.company_email && !settings?.company_phone && <li><i className="fa-solid fa-envelope me-2 text-primary"></i> hello@mysaas.com</li>}
            </ul>
            <div>
              <h6 className="fw-bold mb-3">Subscribe to our newsletter</h6>
              <div className="input-group p-1 bg-white rounded-pill border">
                <input type="email" className="form-control border-0 rounded-pill shadow-none" placeholder="Email address" />
                <button className="btn btn-primary rounded-pill px-4" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12 border-top py-4 text-center text-muted d-md-flex justify-content-between">
            <p className="mb-0">© {currentYear} {settings?.company_name || 'My SaaS'}. All rights reserved.</p>
            <div className="mt-2 mt-md-0 d-flex gap-3 justify-content-center">
              <Link href="/privacy" className="text-muted text-decoration-none small">Privacy Policy</Link>
              <Link href="/terms" className="text-muted text-decoration-none small">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
