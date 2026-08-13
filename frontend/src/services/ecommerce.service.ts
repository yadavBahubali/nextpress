import axiosInstance from '@/lib/axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  stock_quantity: number;
  status: 'draft' | 'published' | 'out_of_stock';
  category_id: number | null;
  category_name?: string;
  featured_image_id: number | null;
  featured_image_url?: string;
  created_at: string;
  acf?: any;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    price: number;
}

export interface Order {
  id: number;
  user_id: number | null;
  user_name?: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'unpaid' | 'paid' | 'failed';
  shipping_address: string;
  billing_address: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    created_at: string;
    total_orders: number;
    total_spent: number | string;
}

const ecommerceService = {
  // Categories
  getAllCategories: async () => {
    const response = await axiosInstance.get('/ecommerce/categories');
    return response.data.data as Category[];
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await axiosInstance.post('/ecommerce/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await axiosInstance.put(`/ecommerce/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await axiosInstance.delete(`/ecommerce/categories/${id}`);
    return response.data;
  },

  // Products
  getAllProducts: async (filters?: any) => {
    const response = await axiosInstance.get('/ecommerce/products', { params: filters });
    return response.data.data as Product[];
  },

  getProductById: async (id: number) => {
    const response = await axiosInstance.get(`/ecommerce/products/${id}`);
    return response.data.data as Product;
  },

  createProduct: async (data: Partial<Product>) => {
    const response = await axiosInstance.post('/ecommerce/products', data);
    return response.data.data;
  },

  updateProduct: async (id: number, data: Partial<Product>) => {
    const response = await axiosInstance.put(`/ecommerce/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await axiosInstance.delete(`/ecommerce/products/${id}`);
    return response.data;
  },

  // Orders
  getAllOrders: async () => {
    const response = await axiosInstance.get('/ecommerce/orders');
    return response.data.data as Order[];
  },

  getOrderById: async (id: number) => {
    const response = await axiosInstance.get(`/ecommerce/orders/${id}`);
    return response.data.data as Order;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`/ecommerce/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id: number, payment_status: string) => {
    const response = await axiosInstance.put(`/ecommerce/orders/${id}/payment`, { payment_status });
    return response.data;
  },

  // Customers
  getAllCustomers: async () => {
    const response = await axiosInstance.get('/ecommerce/customers');
    return response.data.data as Customer[];
  }
};

export default ecommerceService;
