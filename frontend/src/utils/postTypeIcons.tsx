import React from "react";
import * as FaIcons from "react-icons/fa";

// Curated set of icons offered when creating/editing a Post Type. Users pick
// by a plain-English label - they never need to know (or type) the
// underlying react-icons/fa component name.
export const POST_TYPE_ICON_OPTIONS: { name: string; label: string }[] = [
  { name: "FaLayerGroup", label: "Layers (default)" },
  { name: "FaIndustry", label: "Industry" },
  { name: "FaBuilding", label: "Building" },
  { name: "FaBriefcase", label: "Briefcase" },
  { name: "FaCalendarAlt", label: "Calendar / Events" },
  { name: "FaNewspaper", label: "News / Articles" },
  { name: "FaUsers", label: "People / Team" },
  { name: "FaHandshake", label: "Partnership" },
  { name: "FaGlobe", label: "Global / Region" },
  { name: "FaStar", label: "Star / Featured" },
  { name: "FaTag", label: "Tag / Category" },
  { name: "FaList", label: "List" },
  { name: "FaImage", label: "Image / Gallery" },
  { name: "FaFileAlt", label: "Document" },
  { name: "FaShoppingCart", label: "Shopping / Store" },
  { name: "FaChartLine", label: "Chart / Analytics" },
  { name: "FaGraduationCap", label: "Education" },
  { name: "FaHeartbeat", label: "Healthcare" },
  { name: "FaMapMarkerAlt", label: "Location" },
  { name: "FaBox", label: "Product / Box" },
];

// Resolve an icon name (e.g. "FaIndustry") to its actual icon component,
// falling back to a generic icon if the name is missing/unrecognized (e.g.
// an icon typed in by hand before this picker existed).
export const resolvePostTypeIcon = (name?: string | null): React.ReactNode => {
  const IconComp = (name && (FaIcons as Record<string, React.ComponentType>)[name]) || FaIcons.FaLayerGroup;
  return <IconComp />;
};
