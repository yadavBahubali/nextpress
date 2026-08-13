"use client";
import Swal from 'sweetalert2';
import React, { useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProducts, deleteProduct } from "@/store/slices/ecommerceSlice";
import { Product } from "@/services/ecommerce.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function ProductsManagement() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { products, isLoading, error } = useAppSelector((state) => state.ecommerce);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => toast.success("Product deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete product"));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (val: any, p: Product) => (
        <div className="d-flex align-items-center gap-3">
          <div className="bg-light rounded p-2 text-primary">
            <FaBox />
          </div>
          <div>
            <div className="fw-bold text-dark">{p.name}</div>
            <div className="small text-muted"><code>/{p.slug}</code></div>
          </div>
        </div>
      )
    },
    { key: "sku", label: "SKU", sortable: true, render: (val: any) => val || 'N/A' },
    {
      key: "category_name",
      label: "Category",
      sortable: true,
      render: (val: any) => (
        <span className="badge bg-light text-dark border font-monospace">
          {val || 'Uncategorized'}
        </span>
      )
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (val: any, p: Product) => p.sale_price ? (
        <div>
          <div className="text-danger">₹{p.sale_price}</div>
          <div className="text-muted small text-decoration-line-through">₹{p.price}</div>
        </div>
      ) : (
        `₹${p.price}`
      )
    },
    {
      key: "stock_quantity",
      label: "Stock",
      sortable: true,
      render: (val: any) => (
        <span className={`fw-semibold ${val <= 5 ? 'text-danger' : 'text-success'}`}>
          {val} in stock
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${
          val === 'published' ? 'success' : 
          val === 'out_of_stock' ? 'danger' : 'secondary'
        } bg-opacity-10 text-${
          val === 'published' ? 'success' : 
          val === 'out_of_stock' ? 'danger' : 'secondary'
        } text-capitalize`}>
          {val.replace('_', ' ')}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, p: Product) => (
        <div className="d-flex justify-content-end gap-2">
          <Link 
            href={`/${adminPath}/products/edit/${p.id}`} 
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center" 
            style={{ width: '32px', height: '32px' }}
          >
            <FaEdit size={14} />
          </Link>
          <button 
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center" 
            style={{ width: '32px', height: '32px' }}
            onClick={() => handleDelete(p.id, p.name)}
          >
            <FaTrash size={14} />
          </button>
        </div>
      )
    }
  ];

  if (error) return <div className="p-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Product Catalog</h2>
          <p className="text-muted">Manage your inventory, pricing, and product details.</p>
        </div>
        <Link href={`/${adminPath}/products/create`} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 rounded-3">
          <FaPlus size={14} /> Add New Product
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading products...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={products} 
            searchPlaceholder="Search by name, SKU or category..."
            searchKeys={["name", "sku", "category_name"]}
            defaultSortKey="name"
            defaultRowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
