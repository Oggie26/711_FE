import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    LogOut,
    Menu as MenuIcon,
    User,
    Settings,
    ChevronRight,
    Layers
} from 'lucide-react';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, label: 'Bảng điều khiển' },
        { key: '/admin/categories', icon: <Layers className="w-5 h-5 flex-shrink-0" />, label: 'Quản lý danh mục' },
        { key: '/admin/products', icon: <Package className="w-5 h-5 flex-shrink-0" />, label: 'Quản lý sản phẩm' },
        { key: '/admin/orders', icon: <ShoppingBag className="w-5 h-5 flex-shrink-0" />, label: 'Quản lý đơn hàng' },
        { key: '/admin/users', icon: <User className="w-5 h-5 flex-shrink-0" />, label: 'Quản lý người dùng' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans antialiased">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-[80px]' : 'w-[260px]'} flex-shrink-0 transition-all duration-300 ease-in-out bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 z-40`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center border-b border-slate-100 px-6 flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden w-full">
                        <div className="w-8 h-8 rounded-xl bg-[#008061] flex flex-shrink-0 items-center justify-center shadow-sm shadow-[#008061]/20">
                            <span className="text-white font-black text-xs tracking-tighter">7E</span>
                        </div>
                        {!collapsed && (
                            <span className="text-slate-900 font-extrabold text-base tracking-tight whitespace-nowrap">
                                7-Eleven <span className="text-[#008061] font-semibold">Admin</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4 flex flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] flex-1">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.key)}
                                className={`flex items-center gap-3.5 w-full h-11 px-3.5 rounded-xl transition-all duration-200 cursor-pointer text-left group ${isActive
                                    ? 'bg-[#008061]/8 text-[#008061] font-bold'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                    }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <div className={isActive ? 'text-[#008061]' : 'text-slate-400 group-hover:text-slate-600'}>
                                    {item.icon}
                                </div>
                                {!collapsed && <span className="text-[13px] tracking-wide flex-1">{item.label}</span>}
                                {isActive && !collapsed && <div className="w-1.5 h-1.5 rounded-full bg-[#008061]"></div>}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Section */}
                <div className="mt-auto p-4 border-t border-slate-100 relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-3 w-full cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all border border-transparent ${collapsed ? 'justify-center' : 'text-left'}`}
                    >
                        <div className="w-9 h-9 rounded-xl bg-[#008061]/10 flex flex-shrink-0 items-center justify-center text-[#008061] font-bold border border-[#008061]/20">
                            Q
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">Quản trị viên</p>
                                <p className="text-[11px] text-slate-400 truncate">admin@7eleven.com</p>
                            </div>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div className={`absolute bottom-full mb-2 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 ${collapsed ? 'left-2' : 'left-4 right-4'}`}>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('accessToken');
                                    navigate('/login');
                                    window.location.reload();
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent font-bold"
                            >
                                <LogOut className="w-4 h-4" /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-16 flex items-center px-8 bg-white border-b border-b-[#008061]/20 justify-between z-30">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 transition-all rounded-xl"
                    >
                        <MenuIcon className="w-4 h-4" />
                    </button>
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <span>Hệ thống</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#008061]">Không gian quản trị</span>
                    </div>
                </header>

                <nav className="flex-1 p-8 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-8 min-h-[calc(100vh-128px)] shadow-[0_2px_12px_rgba(0,0,0,0.01)] border border-slate-200/60">
                        <Outlet />
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default AdminLayout;