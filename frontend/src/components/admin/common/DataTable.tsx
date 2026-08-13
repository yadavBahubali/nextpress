"use client";

import React, { useState, useMemo } from "react";
import { FaSearch, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaArrowUp, FaArrowDown } from "react-icons/fa";

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  defaultRowsPerPage?: number;
  onRowClick?: (row: T) => void;
}

export default function DataTable({
  columns,
  data = [],
  searchPlaceholder = "Search...",
  searchKeys = [],
  defaultSortKey = "",
  defaultSortDirection = "asc",
  defaultRowsPerPage = 10,
  onRowClick,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // 1. Search Logic
  const searchedData = useMemo(() => {
    if (!searchTerm || searchKeys.length === 0) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row: any) => {
      return searchKeys.some((key) => {
        const val = row[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // 2. Sort Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return searchedData;

    const sorted = [...searchedData].sort((a: any, b: any) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Check if numeric comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Default string comparison
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return sorted;
  }, [searchedData, sortKey, sortDirection]);

  // 3. Pagination Logic
  const totalRows = sortedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  // Reset page when search or sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortDirection, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const showingStart = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const showingEnd = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="acf-datatable w-100">
      {/* Top Search Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Show</span>
          <select
            className="form-select form-select-sm rounded-3 shadow-none"
            style={{ width: "70px" }}
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="small text-muted">entries</span>
        </div>

        {searchKeys.length > 0 && (
          <div className="input-group input-group-sm" style={{ maxWidth: "250px" }}>
            <span className="input-group-text bg-transparent border-end-0 text-muted">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const alignClass =
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-end" : "text-start";

                  return (
                    <th
                      key={col.key}
                      className={`py-3 px-3 ${alignClass} ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{ minWidth: col.key === "actions" ? "120px" : "auto" }}
                    >
                      <div
                        className={`d-flex align-items-center ${
                          col.align === "center"
                            ? "justify-content-center"
                            : col.align === "right"
                            ? "justify-content-end"
                            : "justify-content-start"
                        } gap-1`}
                      >
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-muted opacity-50" style={{ fontSize: "0.7rem" }}>
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <FaArrowUp size={10} className="text-primary opacity-100" />
                              ) : (
                                <FaArrowDown size={10} className="text-primary opacity-100" />
                              )
                            ) : (
                              <div className="d-inline-flex flex-column align-items-center" style={{ lineHeight: 0.6 }}>
                                <FaArrowUp size={8} />
                                <FaArrowDown size={8} />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5 text-muted">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className={onRowClick ? "cursor-pointer hover-shadow-sm" : ""}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-end" : "text-start";
                      const val = (row as any)[col.key];

                      return (
                        <td key={col.key} className={`py-3 px-3 ${alignClass}`}>
                          {col.render ? col.render(val, row, rowIdx) : val !== null && val !== undefined ? String(val) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 px-1">
        <span className="small text-muted">
          Showing {showingStart} to {showingEnd} of {totalRows} entries
          {totalRows !== data.length && ` (filtered from ${data.length} total entries)`}
        </span>

        {totalPages > 1 && (
          <nav aria-label="Table navigation">
            <ul className="pagination pagination-sm mb-0 rounded-3 overflow-hidden">
              {/* First Page */}
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link shadow-none border-0" onClick={() => setCurrentPage(1)}>
                  <FaAngleDoubleLeft size={10} />
                </button>
              </li>

              {/* Prev Page */}
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link shadow-none border-0" onClick={() => setCurrentPage((p) => p - 1)}>
                  <FaAngleLeft size={10} />
                </button>
              </li>

              {/* Dynamic Pages */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Show current page + surrounding 1 pages
                if (pageNum === 1 || pageNum === totalPages || Math.abs(currentPage - pageNum) <= 1) {
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                      <button className="page-link shadow-none border-0" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                } else if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <li key={pageNum} className="page-item disabled">
                      <span className="page-link border-0">...</span>
                    </li>
                  );
                }
                return null;
              })}

              {/* Next Page */}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link shadow-none border-0" onClick={() => setCurrentPage((p) => p + 1)}>
                  <FaAngleRight size={10} />
                </button>
              </li>

              {/* Last Page */}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link shadow-none border-0" onClick={() => setCurrentPage(totalPages)}>
                  <FaAngleDoubleRight size={10} />
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <style jsx global>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .select-none {
          user-select: none;
        }
        .acf-datatable .pagination .page-item .page-link {
          color: #4b5563;
          background-color: #f3f4f6;
          margin: 0 1px;
          border-radius: 4px;
        }
        .acf-datatable .pagination .page-item.active .page-link {
          background-color: var(--bs-primary, #3b82f6) !important;
          color: #ffffff;
        }
        .acf-datatable .pagination .page-item.disabled .page-link {
          color: #9ca3af;
          background-color: #f9fafb;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
