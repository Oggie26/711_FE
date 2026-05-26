import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Layers, CheckCircle, EyeOff, Plus, Trash2, Upload, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CategoryService from '../../service/category/categoryService';
import { uploadToCloudinary } from '../../service/cloudinaryService';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE',
        image: ''
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const apiResponse = await CategoryService.searchCategories(keyword, currentPage, pageSize);
            const pageInfo = apiResponse;
            if (pageInfo) {
                setCategories(pageInfo.data || []);
                setTotalPages(pageInfo.totalPages || 0);
                setTotalElements(pageInfo.totalElements || 0);
            }
        } catch (error) {
            toast.error(error || 'Không thể tải danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [currentPage, keyword]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                setUploading(true);
                const idToast = toast.loading('Đang tải hình ảnh lên Cloudinary...');

                try {
                    const secureUrl = await uploadToCloudinary(base64Image);
                    setFormData(prev => ({ ...prev, image: secureUrl }));
                    toast.success('Tải ảnh lên đám mây thành công! ☁️', { id: idToast });
                } catch (error) {
                    toast.error(error.message || 'Lỗi tải ảnh lên Cloudinary!', { id: idToast });
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();

        if (uploading) {
            toast.error('Vui lòng đợi quá trình tải ảnh lên đám mây hoàn tất!');
            return;
        }

        const loadToast = toast.loading(isEdit ? 'Đang cập nhật danh mục...' : 'Đang tạo danh mục mới...');
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                image: formData.image
            };

            if (isEdit && selectedCategory) {
                await CategoryService.updateCategory(selectedCategory.id, payload);
                toast.success('Cập nhật thông tin danh mục thành công!', { id: loadToast });
            } else {
                await CategoryService.createCategory(payload);
                toast.success('Thêm danh mục mới thành công! 🎉', { id: loadToast });
            }
            setDrawerOpen(false);
            setCurrentPage(0);
            fetchCategories();
        } catch (error) {
            toast.error(error || 'Thao tác thất bại. Vui lòng kiểm tra lại!', { id: loadToast });
        }
    };

    // Hàm xử lý xóa chính thức khi bấm xác nhận trên Modal mới
    const handleConfirmDelete = async () => {
        if (!deleteConfirmId) return;

        const delToast = toast.loading('Đang tiến hành xóa danh mục...');
        try {
            await CategoryService.deleteCategory(deleteConfirmId);
            toast.success('Đã xóa danh mục khỏi hệ thống thành công!', { id: delToast });
            setDeleteConfirmId(null); // Đóng modal xóa
            setDrawerOpen(false); // Đóng luôn cả bản điều khiển drawer nếu đang mở
            fetchCategories(); // Reload data
        } catch (error) {
            toast.error(error || 'Không thể xóa danh mục này!', { id: delToast });
        }
    };

    const activeCount = categories.filter(c => c.status === 'ACTIVE').length;
    const inactiveCount = categories.filter(c => c.status === 'INACTIVE').length;

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all cursor-pointer border ${currentPage === i
                        ? 'bg-[#008061] text-white border-[#008061] shadow-sm shadow-[#008061]/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="w-full">
            <Toaster position="bottom-right" reverseOrder={false} containerStyle={{ zIndex: 99999 }} />

            {/* TIÊU ĐỀ TRANG VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight">Quản lý danh mục</h1>
                    <p className="text-slate-400 m-0 mt-1 text-sm font-medium">Cấu trúc, phân loại hệ thống nhóm sản phẩm phục vụ kinh doanh</p>
                </div>
                <button
                    onClick={() => {
                        setIsEdit(false);
                        setFormData({ name: '', description: '', status: 'ACTIVE', image: '' });
                        setSelectedCategory(null);
                        setDrawerOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#008061] hover:bg-[#006c52] text-white font-bold text-sm h-11 px-5 rounded-xl shadow-sm transition-all active:scale-95 border-none cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Thêm danh mục
                </button>
            </div>

            {/* THẺ THÔNG SỐ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="w-12 h-12 rounded-xl bg-[#008061]/8 text-[#008061] flex items-center justify-center flex-shrink-0"><Layers className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Tổng nhóm danh mục</p>
                        <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{totalElements} danh mục</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Đang hoạt động (ACTIVE)</p>
                        <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{activeCount} trên trang</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0"><EyeOff className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Không hoạt động (INACTIVE)</p>
                        <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{inactiveCount} trên trang</p>
                    </div>
                </div>
            </div>

            {/* THANH TÌM KIẾM */}
            <div className="mb-6 max-w-md relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="text-slate-400 w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setCurrentPage(0);
                    }}
                    placeholder="Tìm theo tên hoặc mô tả danh mục từ DB..."
                    className="w-full bg-white border border-slate-200 text-slate-800 font-semibold placeholder-slate-400 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all"
                />
            </div>

            {/* BẢNG HIỂN THỊ */}
            <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center text-slate-400 font-semibold text-sm gap-2">
                            <div className="w-5 h-5 border-2 border-[#008061] border-t-transparent rounded-full animate-spin"></div>
                            Đang đồng bộ danh mục từ cơ sở dữ liệu...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium text-sm">
                            Không tìm thấy nhóm sản phẩm nào phù hợp.
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Hình ảnh</th>
                                        <th className="px-6 py-4">Tên danh mục</th>
                                        <th className="px-6 py-4">Mô tả ngắn</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                                    {categories.map(category => (
                                        <tr key={category.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-3">
                                                <img
                                                    src={category.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100'}
                                                    alt={category.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                                            <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{category.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${category.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {category.status === 'ACTIVE' ? 'Kinh doanh' : 'Tạm ẩn'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer active:scale-95 mx-auto"
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsEdit(true);
                                                        setFormData({
                                                            name: category.name,
                                                            description: category.description,
                                                            status: category.status || 'ACTIVE',
                                                            image: category.image || ''
                                                        });
                                                        setDrawerOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 text-sm font-semibold text-slate-500 select-none bg-slate-50/50">
                                <div>
                                    Hiển thị bản ghi từ <span className="text-slate-900 font-bold">{currentPage * pageSize + 1}</span> đến <span className="text-slate-900 font-bold">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trên tổng số <span className="text-slate-900 font-bold">{totalElements}</span> mục
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage === 0}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all active:scale-95"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {renderPageNumbers()}

                                    <button
                                        type="button"
                                        disabled={currentPage >= totalPages - 1}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all active:scale-95"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* === HỆ THỐNG MODAL XÁC NHẬN XÓA CAO CẤP (THAY THẾ WINDOW.CONFIRM) === */}
            {deleteConfirmId !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center font-semibold transform transition-all scale-100">
                        <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Xóa nhóm danh mục</h3>
                        <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">
                            Bạn có chắc chắn muốn gỡ bỏ danh mục này? Tất cả các mặt hàng thuộc nhóm này có thể bị ảnh hưởng. Hành động không thể hoàn tác.
                        </p>
                        <div className="flex justify-center gap-3 text-sm">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all cursor-pointer border-none active:scale-95"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/10 cursor-pointer border-none active:scale-95"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DRAWER PANEL CONTROLS */}
            {drawerOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity" onClick={() => setDrawerOpen(false)}></div>
            )}

            <div className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <span className="font-black text-base text-slate-900">{isEdit ? 'Cấu hình thông tin nhóm' : 'Tạo danh mục mới'}</span>
                    <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer active:scale-95">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSaveCategory} className="font-semibold flex flex-col h-full gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tên danh mục hiển thị</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 text-slate-900 font-semibold border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all text-sm"
                                placeholder="Ví dụ: Đồ ăn vặt, Nước uống..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hình ảnh danh mục</label>
                            <div className="flex flex-col gap-3">
                                {formData.image ? (
                                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            disabled={uploading}
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors border-none cursor-pointer disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-[#008061]/50 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#008061] transition-colors mb-2" />
                                            <p className="text-xs text-slate-600 font-bold m-0">Nhấp để tải ảnh lên</p>
                                            <p className="text-[11px] text-slate-400 font-medium m-0 mt-1">Hệ thống sẽ lưu trữ trực tiếp trên Cloudinary</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={uploading}
                                            required={!isEdit}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trạng thái danh mục (EnumStatus)</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all text-sm cursor-pointer"
                            >
                                <option value="ACTIVE">ACTIVE (Kinh doanh)</option>
                                <option value="INACTIVE">INACTIVE (Tạm ẩn)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả chi tiết</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all text-sm resize-none"
                                placeholder="Mô tả tóm tắt về nhóm danh mục này..."
                            />
                        </div>

                        <div className="mt-auto pt-6 flex flex-col gap-2.5 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-[#008061] hover:bg-[#006c52] text-white font-bold h-11 rounded-xl transition-all cursor-pointer text-sm active:scale-95 border-none flex items-center justify-center disabled:opacity-50"
                            >
                                {uploading ? 'Đang tải ảnh lên đám mây...' : 'Lưu thông tin danh mục'}
                            </button>

                            {isEdit && selectedCategory && (
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => setDeleteConfirmId(selectedCategory.id)} // Đã cập nhật kích hoạt Modal xóa thay vì window.confirm
                                    className="w-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100/60 h-11 rounded-xl transition-colors cursor-pointer text-xs font-bold disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Xóa bỏ danh mục hoàn toàn
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;