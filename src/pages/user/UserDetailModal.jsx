import React, { useEffect, useState } from 'react';
import UserService from '../../service/user/UserService';
import { X, User, Mail, Shield, Calendar, Phone, Star, Hash } from 'lucide-react';

const UserDetailModal = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetail = async () => {
            setLoading(true);
            try {
                const response = await UserService.getUserById(userId);
                setUser(response);
            } catch (error) {
                console.error("Lỗi:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUserDetail();
    }, [userId]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-800">Thông tin</h3>
                        <p className="text-slate-400 text-sm">Chi tiết người dùng</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#008061]/20 border-t-[#008061] rounded-full animate-spin"></div>
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        {/* Avatar & Main Info */}
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                            <div className="w-14 h-14 rounded-full bg-[#008061]/10 flex items-center justify-center">
                                <User className="w-7 h-7 text-[#008061]" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-lg truncate">{user.fullName || "Người dùng mới"}</p>
                                <p className="text-[#008061] text-[10px] font-bold uppercase tracking-widest font-mono truncate">
                                    ID: {user.id || "---"}
                                </p>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem icon={Mail} label="Email" value={user.email} colSpan />
                            <InfoItem icon={Phone} label="Điện thoại" value={user.phone} />
                            <InfoItem icon={Calendar} label="Ngày sinh" value={user.birthday} />
                            <InfoItem icon={Star} label="Điểm tích lũy" value={user.point} />
                            <InfoItem
                                icon={Shield}
                                label="Giới tính"
                                value={user.gender === true ? "Nam" : (user.gender === false ? "Nữ" : "Chưa cập nhật")}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-red-500 font-medium">Không tìm thấy dữ liệu</div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value, colSpan }) => (
    <div className={`bg-white border border-slate-100 p-3 rounded-2xl ${colSpan ? 'col-span-2' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{label}</p>
        </div>
        <p className="font-semibold text-slate-700 text-sm truncate">{value ?? "---"}</p>
    </div>
);

export default UserDetailModal;