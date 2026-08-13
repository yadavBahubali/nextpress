"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaFilter, FaShoppingCart, FaCalendarAlt, FaCheckCircle, FaTruck, FaTimesCircle, FaClock, FaCreditCard } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchOrders } from "@/store/slices/ecommerceSlice";
import ecommerceService, { Order } from "@/services/ecommerce.service";
import toast from "react-hot-toast";

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.ecommerce);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const fetchOrderDetails = async (id: number) => {
      try {
          const order = await ecommerceService.getOrderById(id);
          setSelectedOrder(order);
      } catch (err) {
          toast.error("Failed to load order details");
      }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
      try {
          await ecommerceService.updateOrderStatus(id, status);
          toast.success("Status updated");
          dispatch(fetchOrders());
          if (selectedOrder?.id === id) fetchOrderDetails(id);
      } catch (err) {
          toast.error("Failed to update status");
      }
  };

  const handleUpdatePayment = async (id: number, payment_status: string) => {
      try {
          await ecommerceService.updatePaymentStatus(id, payment_status);
          toast.success("Payment status updated");
          dispatch(fetchOrders());
          if (selectedOrder?.id === id) fetchOrderDetails(id);
      } catch (err) {
          toast.error("Failed to update payment");
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'warning';
          case 'processing': return 'info';
          case 'shipped': return 'primary';
          case 'delivered': return 'success';
          case 'cancelled': return 'danger';
          default: return 'secondary';
      }
  };

  const getPaymentColor = (status: string) => {
      switch(status) {
          case 'unpaid': return 'danger';
          case 'paid': return 'success';
          case 'failed': return 'danger';
          default: return 'secondary';
      }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.user_name && o.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Orders Management</h2>
          <p className="text-muted mb-0">Track and fulfill customer orders.</p>
        </div>
      </div>

      <div className="row g-4 flex-grow-1" style={{ minHeight: 0 }}>
        {/* Left: Orders List */}
        <div className={selectedOrder ? "col-lg-5 col-xl-4 h-100 d-flex flex-column" : "col-12 h-100 d-flex flex-column"}>
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                    <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0"><FaSearch className="text-muted"/></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm flex-grow-1 overflow-auto scrollbar-custom">
                <div className="list-group list-group-flush">
                    {isLoading ? (
                        <div className="text-center py-5">Loading orders...</div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div 
                                key={order.id} 
                                className={`list-group-item list-group-item-action cursor-pointer p-3 border-bottom ${selectedOrder?.id === order.id ? 'bg-primary bg-opacity-10 border-primary' : ''}`}
                                onClick={() => fetchOrderDetails(order.id)}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="fw-bold text-dark">#{order.order_number}</span>
                                    <span className={`badge bg-${getStatusColor(order.status)} bg-opacity-10 text-${getStatusColor(order.status)} text-capitalize`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center small text-muted">
                                    <span>{order.user_name || 'Guest'}</span>
                                    <span className="fw-bold text-dark">₹{order.total_amount}</span>
                                </div>
                                <div className="mt-2 small text-muted d-flex align-items-center gap-1">
                                    <FaCalendarAlt size={10}/> {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5 text-muted">No orders found.</div>
                    )}
                </div>
            </div>
        </div>

        {/* Right: Order Detail */}
        {selectedOrder && (
            <div className="col-lg-7 col-xl-8 h-100 d-flex flex-column">
                <div className="card border-0 shadow-sm flex-grow-1 overflow-hidden d-flex flex-column rounded-4">
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-0">Order #{selectedOrder.order_number}</h4>
                            <span className="text-muted small">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</span>
                        </div>
                        <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                    </div>

                    <div className="card-body p-4 overflow-auto scrollbar-custom">
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="small text-muted text-uppercase fw-bold mb-2">Order Status</label>
                                <select 
                                    className={`form-select fw-semibold border-${getStatusColor(selectedOrder.status)}`}
                                    value={selectedOrder.status}
                                    onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="small text-muted text-uppercase fw-bold mb-2">Payment Status</label>
                                <select 
                                    className={`form-select fw-semibold border-${getPaymentColor(selectedOrder.payment_status)}`}
                                    value={selectedOrder.payment_status}
                                    onChange={e => handleUpdatePayment(selectedOrder.id, e.target.value)}
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaTruck className="text-muted"/> Shipping Details</h6>
                                <p className="small mb-1"><strong>Name:</strong> {selectedOrder.user_name || 'Guest'}</p>
                                <p className="small mb-1"><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                <p className="small mb-1"><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                                <div className="p-2 bg-light rounded mt-2 small">{selectedOrder.shipping_address}</div>
                            </div>
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaCreditCard className="text-muted"/> Billing Details</h6>
                                <div className="p-2 bg-light rounded small">{selectedOrder.billing_address}</div>
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaShoppingCart className="text-muted"/> Order Items</h6>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle border rounded">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3 py-2">Product</th>
                                        <th className="py-2 text-center">Qty</th>
                                        <th className="py-2 text-end pe-3">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map(item => (
                                        <tr key={item.id}>
                                            <td className="ps-3 py-3">
                                                <div className="fw-bold">{item.product_name}</div>
                                            </td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end pe-3">₹{item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="fw-bold">
                                    <tr>
                                        <td colSpan={2} className="text-end ps-3 py-3">Total Amount</td>
                                        <td className="text-end pe-3 text-primary fs-5">₹{selectedOrder.total_amount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
      <style jsx>{`
        .cursor-pointer { cursor: pointer; }
        .scrollbar-custom::-webkit-scrollbar { width: 6px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
