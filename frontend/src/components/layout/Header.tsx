"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMenuByLocation } from "@/store/slices/menuSlice";
import { fetchSettingsGroup } from "@/store/slices/settingsSlice";
import { MenuItem } from "@/types/menu";

const buildMenuTree = (flatItems: MenuItem[] = []) => {
  const itemMap = new Map<string | number, MenuItem>();
  const roots: MenuItem[] = [];

  flatItems.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  itemMap.forEach(item => {
    if (item.parent_id && itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortChildren = (nodes: MenuItem[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };
  
  sortChildren(roots);
  return roots;
};

const Header = () => {
  const dispatch = useAppDispatch();
  const { menus } = useAppSelector((state) => state.menu);
  const { settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (!menus['header_main']) {
      dispatch(fetchMenuByLocation('header_main'));
    }
    dispatch(fetchSettingsGroup(['company_name', 'site_logo']));
  }, [dispatch, menus]);

  const headerMenuTree = useMemo(() => {
    return buildMenuTree(menus['header_main']?.items || []);
  }, [menus]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold fs-3 text-primary d-flex align-items-center gap-2">
          {settings?.site_logo ? (
            <img src={settings.site_logo} alt="Logo" height="40" />
          ) : (
            <div className="bg-primary text-white rounded p-2 fs-5 lh-1">
              <i className="fa-solid fa-cube"></i>
            </div>
          )}
          <span>{settings?.company_name || 'My SaaS'}</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
            {headerMenuTree.length > 0 ? (
              headerMenuTree.map(item => (
                <li key={item.id} className={`nav-item ${item.children?.length ? 'dropdown' : ''}`}>
                   <Link href={item.url || '#'} className={`nav-link ${item.children?.length ? 'dropdown-toggle' : ''}`} data-bs-toggle={item.children?.length ? "dropdown" : undefined}>
                      {item.label}
                   </Link>
                   {item.children && item.children.length > 0 && (
                     <ul className="dropdown-menu shadow-sm border-0">
                       {item.children.map(child => (
                         <li key={child.id}><Link href={child.url || '#'} className="dropdown-item py-2">{child.label}</Link></li>
                       ))}
                     </ul>
                   )}
                </li>
              ))
            ) : (
              // Fallback menu if no admin menu is set
              <>
                <li className="nav-item"><Link href="/" className="nav-link">Home</Link></li>
                <li className="nav-item"><Link href="/about" className="nav-link">About</Link></li>
                <li className="nav-item"><Link href="/pricing" className="nav-link">Pricing</Link></li>
                <li className="nav-item"><Link href="/contact" className="nav-link">Contact</Link></li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            <Link href="/admin/login" className="fw-medium text-decoration-none text-dark hover-primary">Sign In</Link>
            <Link href="/admin/login" className="btn btn-primary px-4 rounded-pill shadow-sm">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
