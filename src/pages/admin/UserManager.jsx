import React, { useState, useEffect } from 'react';
import UserService from '../../service/user/userService';
import toast from 'react-hot-toast';
import { Search, User as UserIcon, Eye } from 'lucide-react';
import UserDetailModal from '../user/UserDetailModal';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0 });
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, keyword]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await UserService.searchUser(keyword, pagination.page, pagination.size);

            console.log("Dữ liệu API trả về:", result);

            let data = [];
            let totalPages = 0;

            if (Array.isArray(result)) {
                data = result;
            } else if (result?.content) {
                data = result.content;
                totalPages = result.totalPages || 0;
            } else if (result?.data?.content) {
                data = result.data.content;
                totalPages = result.data.totalPages || 0;
            }

            setUsers(data);
            setPagination(prev => ({ ...prev, totalPages: totalPages }));

        } catch (error) {
            console.error("Lỗi fetchUsers:", error);
            toast.error("Lỗi khi tải dữ liệu");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#008061] w-64"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Mã KH</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-slate-400">Đang tải...</td></tr>
                        ) : users.length > 0 ? users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-600">{user.id}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-[#008061]/10 text-[#008061] rounded-lg text-xs font-bold">
                                        {user.phone}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedUserId(user.id)}
                                        className="p-2 text-slate-400 hover:text-[#008061] hover:bg-[#008061]/10 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center py-10 text-slate-400">Không tìm thấy người dùng</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center gap-2">
                <button disabled={pagination.page === 0} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50">Trước</button>
                <span className="px-4 py-2 font-bold flex items-center">{pagination.page + 1} / {pagination.totalPages || 1}</span>
                <button disabled={pagination.page >= pagination.totalPages - 1} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50">Sau</button>
            </div>

            {selectedUserId && (
                <UserDetailModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default UserManager;