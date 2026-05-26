import React, { useState, useEffect } from 'react';
import { Search, Eye, X, DollarSign, ShoppingBag, CheckCircle, Clock, User as UserIcon, CreditCard, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import OrderService from '../../service/order/orderService';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [globalStats, setGlobalStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchOrders("", 0);
    fetchGlobalStats("");
  }, []);

  const fetchOrders = async (keyword = searchTerm, page = 0) => {
    setLoading(true);
    try {
      const response = await OrderService.searchOrders(keyword, page, 10);

      const responseData = response?.data || {};
      const dataList = responseData.data || responseData.content || responseData || [];

      setOrders(Array.isArray(dataList) ? dataList : []);
      setTotalPages(responseData.totalPages || 1);
      setCurrentPage(responseData.page || responseData.number || 0);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async (keyword = "") => {
    try {
      const response = await OrderService.searchOrders(keyword, 0, 9999);
      const responseData = response?.data || {};
      const allOrders = responseData.data || responseData.content || responseData || [];

      if (Array.isArray(allOrders)) {
        const calculatedStats = allOrders.reduce((acc, order) => {
          acc.total += 1;
          if (order.status === 'PAYMENT_SUCCESS') {
            acc.completed += 1;
            acc.revenue += (order.totalPrice || 0);
          } else if (order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED') {
            acc.cancelled += 1;
          }
          return acc;
        }, { total: 0, completed: 0, cancelled: 0, revenue: 0 });

        setGlobalStats(calculatedStats);
      }
    } catch (error) {
      console.error("Lỗi tính toán thống kê tổng:", error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchOrders(value, 0);
    fetchGlobalStats(value);
  };

  const handleViewDetail = async (order) => {
    try {
      setLoading(true);
      const response = await OrderService.getOrderById(order.id);
      const orderDetail = response?.data?.data || response?.data || response;

      if (orderDetail) {
        setSelectedOrder(orderDetail);
        setDrawerOpen(true);
      } else {
        toast.error("Dữ liệu chi tiết rỗng!");
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ thanh toán', classes: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'PAYMENT_SUCCESS':
        return { label: 'Thành công', classes: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'PAYMENT_FAILED':
        return { label: 'Thất bại', classes: 'bg-red-50 text-red-600 border-red-200' };
      case 'CANCELLED':
        return { label: 'Đã hủy', classes: 'bg-slate-100 text-slate-500 border-slate-300' };
      default:
        return { label: status || 'Chưa rõ', classes: 'bg-sky-50 text-sky-600 border-sky-200' };
    }
  };

  const getPaymentConfig = (payment) => {
    switch (payment) {
      case 'VNPAY':
        return { label: 'Thanh toán qua VNPAY', classes: 'bg-blue-50 text-blue-700 border-blue-200', icon: CreditCard };
      case 'CASH':
        return { label: 'Thanh toán tiền mặt (CASH)', classes: 'bg-orange-50 text-orange-700 border-orange-200', icon: Banknote };
      default:
        return { label: payment || 'Chưa rõ', classes: 'bg-slate-100 text-slate-600 border-slate-200', icon: DollarSign };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có dữ liệu";
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { title: "Tổng đơn hệ thống", val: globalStats.total, icon: ShoppingBag, color: "text-sky-600" },
          { title: "Tổng đơn thành công", val: globalStats.completed, icon: CheckCircle, color: "text-emerald-600" },
          { title: "Tổng đơn thất bại/hủy", val: globalStats.cancelled, icon: X, color: "text-red-600" },
          { title: "Tổng doanh thu", val: `${globalStats.revenue.toLocaleString()} ₫`, icon: DollarSign, color: "text-[#008061]" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${item.color}`}><item.icon size={20} /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.title}</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Tìm mã đơn hàng..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#008061] focus:ring-1 focus:ring-[#008061] outline-none text-sm font-medium transition-all"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã đơn</th>
                <th className="px-6 py-4 whitespace-nowrap">Thanh toán</th>
                <th className="px-6 py-4 whitespace-nowrap">Tổng tiền</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">Không tìm thấy đơn hàng nào</td>
                </tr>
              ) : (
                orders.map(order => {
                  const statusObj = getStatusConfig(order.status);
                  const paymentObj = getPaymentConfig(order.paymentMethod || order.payment);
                  const PaymentIcon = paymentObj.icon;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#008061]">#{String(order.orderCode || order.id).slice(-8)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${paymentObj.classes}`}>
                          <PaymentIcon className="w-3.5 h-3.5" />
                          {order.paymentMethod || order.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{order.totalPrice?.toLocaleString()} ₫</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusObj.classes}`}>
                          {statusObj.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleViewDetail(order)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-[#008061] text-slate-500 transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-500 font-bold">
              Hiển thị trang <span className="text-slate-900 font-extrabold">{currentPage + 1}</span> / {totalPages} (Tổng {globalStats.total} đơn)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchOrders(searchTerm, currentPage - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchOrders(searchTerm, i)}
                  className={`w-9 h-9 rounded-xl text-xs font-black border transition-all cursor-pointer ${currentPage === i
                    ? 'bg-[#008061] text-white border-[#008061] shadow-md shadow-[#008061]/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchOrders(searchTerm, currentPage + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {drawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="w-full sm:w-[460px] bg-white h-full shadow-2xl relative flex flex-col transform transition-transform duration-300 translate-x-0">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chi tiết hóa đơn</span>
                <h2 className="text-lg font-black text-[#008061]">#{String(selectedOrder.orderCode || selectedOrder.id).slice(-8)}</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-8 space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                  <span className="text-sm font-semibold text-slate-600">Trạng thái</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusConfig(selectedOrder.status).classes}`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Khách hàng</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedOrder.fullName || "Khách vãng lai"}</p>
                    {selectedOrder.userId && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">ID: {selectedOrder.userId}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Thời gian tạo
                  </span>
                  <span className="font-bold text-slate-700 text-xs">{formatDate(selectedOrder.orderDate)}</span>
                </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phương thức thanh toán</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${getPaymentConfig(selectedOrder.paymentMethod || selectedOrder.payment).classes}`}>
                    {getPaymentConfig(selectedOrder.paymentMethod || selectedOrder.payment).label}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Danh sách sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                      <img
                        src={item.thumbnail || item.productThumbnail || 'https://via.placeholder.com/50'}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-900 line-clamp-1 block">{item.productName}</span>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {item.price?.toLocaleString()} ₫ <span className="text-slate-300 mx-1">x</span> {item.quantity}
                        </span>
                      </div>
                      <span className="font-black text-[#008061] text-sm flex-shrink-0">
                        {(item.price * item.quantity).toLocaleString()} ₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm uppercase">Tổng thanh toán</span>
                <span className="font-black text-red-600 text-2xl">{selectedOrder.totalPrice?.toLocaleString()} ₫</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;