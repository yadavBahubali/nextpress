"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { resolvePostTypeIcon } from "@/utils/postTypeIcons";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaThLarge,
  FaImages,
  FaBox,
  FaList,
  FaShoppingCart,
  FaUsers,
  FaBars,
  FaCog,
  FaSearch,
  FaUserShield,
  FaSignOutAlt,
  FaPage4,
  FaChevronDown,
  FaChartLine,
  FaInbox,
  FaChevronRight,
  FaChartPie,
  FaLayerGroup
} from "react-icons/fa";
import { authService } from "@/services/auth.service";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { PostType } from "@/services/cpt.service";

interface SubMenuItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  menuKey?: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href?: string;
  id?: string;
  subItems?: SubMenuItem[];
  // Ties this item to a backend-enforced section grant (see
  // modules/permissions). Only checked for role_id 3 (Editor) / 5 (Staff
  // Viewer) - Super Admin/Admin always see everything, and items without a
  // menuKey (sections not yet wired into the granular permission system)
  // fall back to the group's roleIds check, same as before.
  menuKey?: string;
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
  const { user } = useAuthStore();

  const roleId = user?.role_id || 4; // Default to viewer if not found
  const isConfigurableRole = roleId === 3 || roleId === 5;

  // Editor/Staff Viewer's actual granted sections (see modules/permissions).
  // Super Admin/Admin never need this - they always see everything.
  const [myPermissions, setMyPermissions] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isConfigurableRole) return;
    import('@/services/permissions.service').then(({ permissionsService }) => {
      permissionsService.getMine().then((keys) => setMyPermissions(new Set(keys))).catch(() => {});
    });
  }, [isConfigurableRole]);

  // Items/subItems with a menuKey are gated by the permission grant for
  // role 3/5; ones without (sections not yet migrated to the granular
  // system) fall back to being visible whenever the group itself is,
  // matching the pre-existing behavior for those sections. Only Super
  // Admin/Admin get an unconditional pass - any other role (4, or anything
  // unrecognized) never sees a nav item, full stop. AdminLayoutClient
  // already keeps role 4 out of /admin entirely, but this stays correct
  // independently rather than relying solely on that outer guard.
  const hasItemAccess = (item: MenuItem | SubMenuItem) => {
    if ([1, 2].includes(Number(roleId))) return true;
    if (!isConfigurableRole) return false;
    if (!item.menuKey) return true;
    return myPermissions.has(item.menuKey);
  };

  // A parent item (e.g. "Blogs") with subItems is gated by whether *any* of
  // its children remain visible, not by a menuKey of its own - it has no
  // href/permission itself, it's purely an expandable grouping.
  const filterMenuItem = (item: MenuItem): MenuItem | null => {
    if (item.subItems && item.subItems.length > 0) {
      const visibleSubItems = item.subItems.filter(hasItemAccess);
      return visibleSubItems.length > 0 ? { ...item, subItems: visibleSubItems } : null;
    }
    return hasItemAccess(item) ? item : null;
  };

  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    ecommerce: true,
    sales_leads: true,
    hr_careers: true,
  });

  React.useEffect(() => {
    import('@/services/settings.service').then(({ settingsService }) => {
      settingsService.getSystemModules().then((res: any) => {
        if(res && res.data) {
          const modMap: Record<string, boolean> = {};
          res.data.forEach((m: any) => {
            modMap[m.module_key] = m.is_enabled === 1;
          });
          setActiveModules(prev => ({ ...prev, ...modMap }));
        }
      });
    });
  }, []);

  // Custom Post Types (e.g. Industries, and any future type) are registered
  // in the DB, not hardcoded here - a brand-new CPT appears in the sidebar
  // automatically once it exists, with no code change.
  const [postTypes, setPostTypes] = useState<PostType[]>([]);

  React.useEffect(() => {
    import('@/services/cpt.service').then(({ cptService }) => {
      cptService.getActiveTypes().then((res) => {
        if (res && res.data) setPostTypes(res.data);
      }).catch(() => { /* CPT engine optional - fail silently */ });
    });
  }, []);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    content: pathname?.includes("/pages") || pathname?.includes("/blogs") || pathname?.includes("/acf"),
    appearance: pathname?.includes("/appearance"),
    ecommerce: pathname?.includes("/products") || pathname?.includes("/categories") || pathname?.includes("/orders") || pathname?.includes("/customers"),
    administration: pathname?.includes("/settings") || pathname?.includes("/users") || pathname?.includes("/seo"),
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const menuGroups: { group: string; roleIds?: number[]; moduleKey?: string; items: MenuItem[] }[] = [
    {
      group: "General",
      items: [
        {
          name: "Dashboard",
          icon: <FaTachometerAlt />,
          href: `/${adminPath}/dashboard`,
          // Checkbox-controlled like everything else for Editor/Staff
          // Viewer - not a free baseline. Super Admin/Admin are unaffected.
          menuKey: "dashboard",
        },
      ],
    },
    {
      // Super Admin/Admin always see this; Editor(3)/Staff Viewer(5) only if
      // granted at least one of its items (see hasItemAccess below) - the
      // whole group is hidden for them otherwise, not just shown empty.
      group: "Sales & Leads",
      moduleKey: "sales_leads",
      roleIds: [1, 2, 3, 5],
      items: [
        {
          name: "Dashboard",
          icon: <FaChartLine />,
          href: `/${adminPath}/sales`,
          menuKey: "sales.dashboard",
        },
        {
          name: "Lead Inbox",
          icon: <FaInbox />,
          href: `/${adminPath}/forms/submissions`,
          menuKey: "sales.leads",
        },
      ],
    },
    {
      group: "HR & Careers",
      moduleKey: "hr_careers",
      roleIds: [1, 2, 3, 5],
      items: [
        {
          name: "Dashboard",
          icon: <FaChartPie />,
          href: `/${adminPath}/hr/dashboard`,
          menuKey: "hr.dashboard",
        },
        {
          name: "Job Board",
          icon: <FaFileAlt />,
          href: `/${adminPath}/hr/jobs`,
          menuKey: "hr.jobs",
        },
        {
          name: "Applicants ATS",
          icon: <FaUsers />,
          href: `/${adminPath}/hr/applications`,
          menuKey: "hr.applications",
        },
      ],
    },
    {
      group: "CMS Management",
      roleIds: [1, 2, 3, 5],
      items: [
        {
          name: "Content",
          icon: <FaFileAlt />,
          id: "content",
          subItems: [
            { name: "All Pages", icon: <FaFileAlt />, href: `/${adminPath}/pages`, menuKey: "cms.pages" },
            { name: "ACF Fields", icon: <FaPage4 />, href: `/${adminPath}/acf`, menuKey: "cms.acf" },
          ],
        },
        {
          name: "Blogs",
          icon: <FaThLarge />,
          id: "blogs_group",
          subItems: [
            { name: "All Stories", href: `/${adminPath}/blogs`, menuKey: "cms.blogs" },
            { name: "Write New", href: `/${adminPath}/blogs/create`, menuKey: "cms.blogs" },
            { name: "Categories", href: `/${adminPath}/blogs/categories`, menuKey: "cms.blogs" },
            { name: "Config", href: `/${adminPath}/settings/writing`, menuKey: "admin.settings" },
          ],
        },
        { name: "Media Library", icon: <FaImages />, href: `/${adminPath}/media`, menuKey: "cms.media" },
        {
          name: "Appearance",
          icon: <FaBars />,
          id: "appearance",
          subItems: [
            { name: "Menus", icon: <FaBars />, href: `/${adminPath}/appearance/menus`, menuKey: "cms.menus" },
          ],
        },
        {
          name: "Forms",
          icon: <FaList />,
          id: "forms_group",
          subItems: [
            { name: "All Forms", href: `/${adminPath}/forms`, menuKey: "cms.forms" },
            { name: "Submissions", href: `/${adminPath}/forms/submissions`, menuKey: "sales.leads" },
          ],
        },
      ],
    },
    // Custom Post Types - one item per active, registered CPT (e.g.
    // Industries). New types (Events, News, ...) appear here automatically
    // as soon as they're registered, with no further code changes.
    ...(postTypes.length > 0
      ? [
          {
            group: "Custom Content",
            roleIds: [1, 2, 3, 5],
            items: postTypes.map((pt) => ({
              name: pt.label,
              icon: resolvePostTypeIcon(pt.icon),
              href: `/${adminPath}/cpt/${pt.slug}`,
              // Matches the backend's per-post-type grant (modules/permissions
              // + cpt.routes.js) - new CPTs are automatically checkbox-able
              // and automatically show/hide here, no code change needed.
              menuKey: `cpt.${pt.slug}`,
            })),
          },
        ]
      : []),
    {
      group: "Ecommerce",
      moduleKey: "ecommerce",
      roleIds: [1, 2],
      items: [
        {
          name: "Shop Dashboard",
          icon: <FaChartLine />,
          href: `/${adminPath}/ecommerce/dashboard`,
        },
        {
          name: "Shop",
          icon: <FaBox />,
          id: "ecommerce",
          subItems: [
            { name: "Products", icon: <FaBox />, href: `/${adminPath}/products` },
            { name: "Categories", icon: <FaList />, href: `/${adminPath}/categories` },
            { name: "Orders", icon: <FaShoppingCart />, href: `/${adminPath}/orders` },
            { name: "Customers", icon: <FaUsers />, href: `/${adminPath}/customers` },
          ],
        },
      ],
    },
    {
      group: "Administration",
      roleIds: [1, 2],
      items: [
        {
          name: "Settings",
          icon: <FaCog />,
          id: "administration",
          subItems: [
            { name: "General", icon: <FaCog />, href: `/${adminPath}/settings/general` },
            { name: "Company & Social", icon: <FaBox />, href: `/${adminPath}/settings/company` },
            { name: "Writing", icon: <FaFileAlt />, href: `/${adminPath}/settings/writing` },
            { name: "Reading", icon: <FaThLarge />, href: `/${adminPath}/settings/reading` },
            { name: "Media Settings", icon: <FaImages />, href: `/${adminPath}/settings/media` },
            { name: "SMTP Config", icon: <FaShoppingCart />, href: `/${adminPath}/settings/smtp` },
            { name: "Integrations", icon: <FaSearch />, href: `/${adminPath}/settings/integrations` },
          ],
        },
        {
          name: "Users",
          icon: <FaUserShield />,
          id: "users_group",
          subItems: [
            { name: "All Users", icon: <FaUserShield />, href: `/${adminPath}/users` },
            { name: "Authors", icon: <FaUsers />, href: `/${adminPath}/users/authors` },
          ],
        },
        {
          name: "SEO Manager",
          icon: <FaSearch />,
          href: `/${adminPath}/settings/seo`,
        },
        {
          name: "Post Types",
          icon: <FaLayerGroup />,
          href: `/${adminPath}/cpt-types`,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      router.push(`/${adminPath}/login`);
      router.refresh();
    }
  };

  const isSubItemActive = (subItems: SubMenuItem[]) => {
    return subItems.some(item => pathname === item.href);
  };

  return (
    <div
      className="bg-dark text-white vh-100 position-fixed overflow-auto scrollbar-hidden"
      style={{ width: "250px" }}
    >
      <div className="p-4 mb-2">
        <Image
          src="/nextpress.png"
          alt="NextPress"
          width={180}
          height={50}
          loading="eager"
          className="mb-0"
          unoptimized
        />
      </div>

      <div className="pb-5">
        {menuGroups
          .filter((group) => {
            if (group.roleIds && !group.roleIds.includes(Number(roleId))) return false;
            if (group.moduleKey && activeModules[group.moduleKey] === false) return false;
            return true;
          })
          .map((group) => ({
            ...group,
            items: group.items.map(filterMenuItem).filter((item): item is MenuItem => item !== null),
          }))
          // A group that lost every item to a permission check (Editor/Viewer
          // granted nothing in it yet) shouldn't render as an empty header.
          .filter((group) => group.items.length > 0)
          .map((group, gIndex) => (
          <div key={group.group} className={gIndex > 0 ? "mt-4" : ""}>
            <div className="px-4 mb-2 text-uppercase small text-white fw-bold" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
              {group.group}
            </div>
            <ul className="nav flex-column">
              {group.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = item.id ? openMenus[item.id] : false;
                const activeParent = hasSubItems && item.subItems ? isSubItemActive(item.subItems) : false;

                return (
                  <li key={item.name} className="nav-item">
                    {hasSubItems ? (
                      <>
                        <div
                          className={`nav-link text-white d-flex align-items-center justify-content-between py-2 px-4 cursor-pointer ${
                            activeParent ? "text-primary" : "hover-bg-secondary"
                          }`}
                          onClick={() => item.id && toggleMenu(item.id)}
                          style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <span style={{ width: '20px', display: 'inline-flex', justifyContent: 'center' }}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                        </div>
                        {isOpen && (
                          <ul className="nav flex-column bg-black bg-opacity-25">
                            {item.subItems?.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={`nav-link text-white d-flex align-items-center gap-3 py-2 ps-5 pe-4 ${
                                    pathname === sub.href ? "bg-primary text-white" : "hover-bg-secondary text-white-50"
                                  }`}
                                  style={{ fontSize: '0.85rem' }}
                                >
                                  <span>{sub.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className={`nav-link text-white d-flex align-items-center gap-3 py-2 px-4 ${
                          pathname === item.href ? "bg-primary" : "hover-bg-secondary"
                        }`}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <span style={{ width: '20px', display: 'inline-flex', justifyContent: 'center' }}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-top border-secondary">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 mb-2"
        >
          <FaSignOutAlt /> Logout
        </button>
        <Link
          href="/"
          className="btn btn-outline-light btn-sm w-100 rounded-pill"
        >
          Back to Site
        </Link>
      </div>

      <style jsx>{`
        .hover-bg-secondary:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
