import React, { useState, useEffect } from 'react';
import { User, Package, Mail, Phone, Calendar, LogOut, ChevronDown, Eye, X, Clock, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/user/UserService';
import OrderService from '../../service/order/OrderService';
import toast, { Toaster } from 'react-hot-toast';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await UserService.profile();
            setUser(res?.data || res);
        } catch (error) { toast.error("Không tải được profile"); }
    };

    const fetchOrders = async () => {
        try {
            const res = await OrderService.getMyOrders();
            const data = res?.data || res || [];
            setOrders(Array.isArray(data) ? data : (data.id ? [data] : []));
        } catch (error) { toast.error("Không tải được đơn hàng"); }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ thanh toán', classes: 'bg-amber-50 text-amber-600 border-amber-200' };
            case 'PAYMENT_SUCCESS': return { label: 'Thành công', classes: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
            default: return { label: status || 'Đang xử lý', classes: 'bg-sky-50 text-sky-600 border-sky-200' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-right" />

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm h-[76px] flex items-center justify-between px-10">
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                    <span className="text-3xl font-black text-[#e4252b]">7</span>
                    <span className="text-3xl font-black text-[#008061]">-ELEVEn</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-sm font-bold text-gray-600 hover:text-[#008061]">Trang chủ</button>
                    <div className="flex items-center gap-3 bg-gray-50 border px-4 py-2 rounded-lg font-bold text-sm">
                        <User size={16} className="text-[#008061]" /> {user?.fullName || "Tài khoản"}
                        <button onClick={() => { localStorage.removeItem('accessToken'); navigate('/login'); }}><LogOut size={16} className="text-red-500" /></button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="pt-[120px] pb-12 max-w-6xl mx-auto px-6">
                <h1 className="text-4xl font-black text-slate-800 mb-8">Tài khoản của tôi</h1>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3 space-y-2">
                        <SidebarButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20} />} label="Hồ sơ cá nhân" />
                        <SidebarButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={20} />} label="Đơn hàng" />
                    </div>

                    <div className="md:col-span-9 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        {activeTab === 'profile' ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Thông tin cá nhân</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <ProfileField label="Họ tên" value={user?.fullName} icon={<User size={16} />} />
                                    <ProfileField label="Email" value={user?.email} icon={<Mail size={16} />} />
                                    <ProfileField label="Điện thoại" value={user?.phone} icon={<Phone size={16} />} />
                                    <ProfileField label="Ngày sinh" value={user?.birthday} icon={<Calendar size={16} />} />
                                    <ProfileField label="Giới tính" value={user?.gender ? "Nam" : "Nữ"} icon={<Shield size={16} />} />
                                    <ProfileField label="Điểm tích lũy" value={user?.point || 0} icon={<Star size={16} />} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Đơn hàng của bạn</h2>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-slate-400 uppercase text-left border-b">
                                            <th className="pb-4">Mã đơn</th>
                                            <th className="pb-4">Giá</th>
                                            <th className="pb-4 text-center">Trạng thái</th>
                                            <th className="pb-4 text-right">Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map(o => (
                                            <tr key={o.id} className="hover:bg-slate-50">
                                                <td className="py-4 font-bold text-[#008061]">#{String(o.orderCode || o.id).slice(-6)}</td>
                                                <td className="py-4 font-bold">{o.totalPrice?.toLocaleString()}đ</td>
                                                <td className="py-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusConfig(o.status).classes}`}>{getStatusConfig(o.status).label}</span></td>
                                                <td className="py-4 text-right">
                                                    <button onClick={() => setSelectedOrder(o)} className="p-2 hover:bg-slate-200 rounded-lg"><Eye size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {selectedOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Chi tiết đơn hàng</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-bold text-[#008061]">{selectedOrder.orderCode}</span>
                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200">Thành công</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <img src={item.thumbnail || 'https://via.placeholder.com/60'} alt={item.productName} className="w-16 h-16 object-cover rounded-xl border bg-white" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                                        <p className="text-xs text-slate-500 font-medium">Số lượng: {item.quantity}</p>
                                    </div>
                                    <span className="font-black text-slate-800">{item.price?.toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="bg-[#008061] text-white p-4 rounded-2xl flex justify-between items-center shadow-lg shadow-[#008061]/20">
                                <span className="font-bold text-sm uppercase tracking-wider">Tổng cộng</span>
                                <span className="text-xl font-black">{selectedOrder.totalPrice?.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SidebarButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`w-full flex items-center px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-[#008061] text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
        <span className="mr-3">{icon}</span> {label}
    </button>
);

const ProfileField = ({ label, value, icon }) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2 mb-2">{icon} {label}</label>
        <p className="font-bold text-slate-800 text-sm">{value ?? "---"}</p>
    </div>
);

export default UserProfile;