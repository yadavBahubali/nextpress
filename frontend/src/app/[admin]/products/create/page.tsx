"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaSave, FaBox, FaImage } from "react-icons/fa";
import Link from "next/link";
import ecommerceService, { Product, Category } from "@/services/ecommerce.service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import WysiwygField from "@/components/admin/page-editor/fields/WysiwygField";

export default function CreateProductPage() {
  const router = useRouter();
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    price: 0,
    sale_price: null,
    sku: "",
    stock_quantity: 0,
    status: "draft",
    category_id: null,
    description: "",
    short_description: ""
  });

  useEffect(() => {
    ecommerceService.getAllCategories().then(setCategories).catch(console.error);
  }, []);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!formData.name || !formData.slug || !formData.price) {
        toast.error("Name, Slug and Price are required");
        return;
      }
      
      await ecommerceService.createProduct(formData);
      toast.success("Product created successfully!");
      router.push(`/${adminPath}/products`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href={`/${adminPath}/products`} className="btn btn-light border rounded-circle p-2">
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="fw-bold mb-0">Add New Product</h2>
            <p className="text-muted mb-0">Fill in the details to list a new product in your shop.</p>
          </div>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FaSave />}
          Save Product
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
            <h5 className="fw-bold mb-4">Basic Information</h5>
            <div className="mb-4">
              <label className="form-label fw-semibold">Product Name <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                value={formData.name} 
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value, slug: prev.slug || generateSlug(e.target.value) }))} 
                placeholder="e.g. 75 Inch Interactive Board"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Description</label>
              <WysiwygField 
                field={{ type: "wysiwyg", label: "Description", name: "description", id: "description", key: "description" }}
                value={formData.description || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              />
            </div>
            <div className="mb-0">
              <label className="form-label fw-semibold">Short Description</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={formData.short_description || ''} 
                onChange={e => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-4">Pricing & Inventory</h5>
            <div className="mb-3">
                <label className="form-label small fw-semibold">Regular Price (₹) <span className="text-danger">*</span></label>
                <input type="number" className="form-control" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))} />
            </div>
            <div className="mb-3">
                <label className="form-label small fw-semibold">Sale Price (₹)</label>
                <input type="number" className="form-control" value={formData.sale_price || ''} onChange={e => setFormData(prev => ({ ...prev, sale_price: e.target.value ? parseFloat(e.target.value) : null }))} />
            </div>
            <div className="mb-3">
                <label className="form-label small fw-semibold">SKU</label>
                <input type="text" className="form-control" value={formData.sku || ''} onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))} />
            </div>
            <div className="mb-0">
                <label className="form-label small fw-semibold">Stock Quantity</label>
                <input type="number" className="form-control" value={formData.stock_quantity} onChange={e => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))} />
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-4">Organization</h5>
            <div className="mb-3">
                <label className="form-label small fw-semibold">Slug <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} />
            </div>
            <div className="mb-3">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select" value={formData.category_id || ''} onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : null }))}>
                    <option value="">-- Uncategorized --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="mb-0">
                <label className="form-label small fw-semibold">Status</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
