import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Layers, Package, AlertTriangle, CheckCircle2, Upload, ChevronLeft, ChevronRight, Maximize2, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Barcode from 'react-barcode';
import ProductService from '../../service/product/productService';
import CategoryService from '../../service/category/categoryService';
import { uploadToCloudinary } from '../../service/cloudinaryService';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);

  const [zoomImageUrl, setZoomImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    unit: 'PIECE',
    stock: '',
    status: 'ACTIVE',
    categoryId: '',
    thumbnail: '',
    imageUrls: [],
    barcode: ''
  });

  const fetchPagedProducts = async () => {
    setLoading(true);
    try {
      const apiResponse = await ProductService.searchProducts(keyword, currentPage, pageSize);
      const pageInfo = apiResponse;
      if (pageInfo) {
        setProducts(pageInfo.data || []);
        setTotalPages(pageInfo.totalPages || 0);
        setTotalElements(pageInfo.totalElements || 0);
      }
    } catch (error) {
      toast.error(error || 'Không thể tải danh sách sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const apiResponse = await CategoryService.getAllCategories();
      const catList = apiResponse || [];
      setCategories(catList);
      if (catList.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: String(catList[0].id) }));
      }
    } catch (error) {
      console.error('Lỗi tải danh mục bổ trợ:', error);
    }
  };

  useEffect(() => {
    fetchPagedProducts();
  }, [currentPage, keyword]);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Upload ảnh Thumbnail chính (1 ảnh)
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setUploadingThumbnail(true);
        const idToast = toast.loading('Đang tải ảnh đại diện lên Cloudinary...');
        try {
          const secureUrl = await uploadToCloudinary(reader.result);
          setFormData(prev => ({ ...prev, thumbnail: secureUrl }));
          toast.success('Tải ảnh đại diện thành công! 🖼️', { id: idToast });
        } catch (error) {
          toast.error(error.message || 'Lỗi tải ảnh đại diện!', { id: idToast });
        } finally {
          setUploadingThumbnail(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // === ĐÃ NÂNG CẤP: Hàm xử lý upload NHIỀU ẢNH chi tiết cùng một lúc ===
  const handleDetailImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingDetail(true);
    const idToast = toast.loading(`Đang tải ${files.length} hình ảnh mô tả lên Cloudinary...`);

    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          if (file.size > 2 * 1024 * 1024) {
            toast.error(`File ${file.name} quá lớn (>2MB), hệ thống sẽ bỏ qua.`);
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const url = await uploadToCloudinary(reader.result);
              resolve(url);
            } catch (err) {
              resolve(null);
            }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);

      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...validUrls]
      }));

      toast.success(`Đã hoàn tất tải lên ${validUrls.length} ảnh mô tả! ☁️`, { id: idToast });
    } catch (error) {
      toast.error('Có lỗi xảy ra trong quá trình upload loạt ảnh!', { id: idToast });
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleRemoveDetailImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (uploadingThumbnail || uploadingDetail) {
      toast.error('Vui lòng đợi quá trình tải dữ liệu hình ảnh hoàn tất!');
      return;
    }

    if (!formData.thumbnail) {
      toast.error('Vui lòng chọn hình ảnh Thumbnail bắt buộc cho sản phẩm!');
      return;
    }

    const idToast = toast.loading(isEdit ? 'Đang cập nhật thông tin sản phẩm...' : 'Đang thêm sản phẩm vào kho...');
    try {
      const imagePayload = formData.imageUrls.map(url => ({ image: url }));

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        unit: formData.unit,
        thumbnail: formData.thumbnail,
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        categoryId: parseInt(formData.categoryId),
        image: imagePayload
      };

      if (isEdit && selectedProductId) {
        const updatePayload = { ...payload, barcode: formData.barcode };
        await ProductService.updateProduct(selectedProductId, updatePayload);
        toast.success('Cập nhật sản phẩm thành công! ✨', { id: idToast });
      } else {
        await ProductService.createProduct(payload);
        toast.success('Thêm sản phẩm mới vào kho thành công! 🎉', { id: idToast });
      }

      setDrawerOpen(false);
      setCurrentPage(0);
      fetchPagedProducts();
    } catch (error) {
      toast.error(error || 'Thao tác sản phẩm thất bại!', { id: idToast });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const delToast = toast.loading('Đang tiến hành gỡ bỏ mặt hàng...');
    try {
      await ProductService.deleteProduct(deleteConfirmId);
      toast.success('Đã xóa sản phẩm khỏi kho hàng thành công!', { id: delToast });
      setDeleteConfirmId(null);
      fetchPagedProducts();
    } catch (error) {
      toast.error(error || 'Không thể xóa sản phẩm này!', { id: delToast });
    }
  };

  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const activeCount = products.filter(p => p.status === 'ACTIVE').length;

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

  const getUnitLabel = (unit) => {
    switch (unit) {
      case 'PIECE': return 'chiếc';
      case 'BOTTLE': return 'chai';
      case 'CAN': return 'lon';
      case 'PACK': return 'gói';
      default: return 'sản phẩm';
    }
  };

  return (
    <div className="w-full">
      <Toaster position="bottom-right" reverseOrder={false} containerStyle={{ zIndex: 99999 }} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-slate-400 m-0 mt-1 text-sm font-medium">Theo dõi và cập nhật danh mục hàng hóa trong kho</p>
        </div>
        <button
          className="bg-[#008061] hover:bg-[#006c52] border-none flex items-center gap-2 h-11 px-5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-sm shadow-[#008061]/10"
          onClick={() => {
            setIsEdit(false);
            setSelectedProductId(null);
            setFormData({
              name: '', description: '', price: '', weight: '',
              unit: 'PIECE', stock: '', status: 'ACTIVE',
              categoryId: categories[0]?.id ? String(categories[0].id) : '',
              thumbnail: '', imageUrls: [], barcode: ''
            });
            setDrawerOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="w-12 h-12 rounded-xl bg-[#008061]/8 text-[#008061] flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Tổng số dữ liệu</p>
            <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{totalElements} mặt hàng</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Đang hoạt động (ACTIVE)</p>
            <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{activeCount} trên trang</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider m-0">Hết hàng (Stock = 0)</p>
            <p className="text-lg font-black text-slate-900 m-0 mt-0.5">{outOfStockCount} trên trang</p>
          </div>
        </div>
      </div>

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
          placeholder="Tìm kiếm theo tên, mô tả hoặc quét barcode sản phẩm..."
          className="w-full bg-white border border-slate-200 text-slate-800 font-semibold placeholder-slate-400 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all"
        />
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-slate-400 font-semibold text-sm gap-2">
              <div className="w-5 h-5 border-2 border-[#008061] border-t-transparent rounded-full animate-spin"></div>
              Đang truy vấn hàng hóa từ hệ thống...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">Không tìm thấy sản phẩm nào phù hợp.</div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Hình ảnh</th>
                    <th className="px-6 py-4">Tên sản phẩm</th>
                    <th className="px-6 py-4">Mã Barcode</th>
                    <th className="px-6 py-4">Danh mục</th>
                    <th className="px-6 py-4">Đơn giá</th>
                    <th className="px-6 py-4">Tồn kho</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                  {products.map(product => {
                    const currentImg = product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100';

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-3 cursor-zoom-in relative group/img" onClick={() => setZoomImageUrl(currentImg)}>
                          <div className="w-10 h-10 rounded-lg border border-slate-100 overflow-hidden relative bg-slate-50">
                            <img src={currentImg} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-slate-900/15 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <Maximize2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                        <td className="px-6 py-4">
                          {product.barcode ? (
                            <div className="bg-white p-1 rounded border border-slate-100 inline-block">
                              <Barcode value={product.barcode} format="CODE128" height={26} width={1.1} fontSize={9} margin={0} />
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-medium">Chưa sinh mã</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{product.categoryName}</td>
                        <td className="px-6 py-4 text-slate-900 font-black">{(product.price || 0).toLocaleString()} VND</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{product.stock} {getUnitLabel(product.unit)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wide ${product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {product.status === 'ACTIVE' ? 'Kinh doanh' : 'Tạm ẩn'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer active:scale-95"
                              onClick={() => {
                                setSelectedProductId(product.id);
                                setIsEdit(true);
                                const targetCategory = categories.find(c => c.name === product.categoryName);

                                const extractedUrls = product.images ? product.images.map(img => img.url).filter(url => url !== null) : [];

                                setFormData({
                                  name: product.name,
                                  description: product.description || '',
                                  price: product.price,
                                  weight: product.weight || '',
                                  unit: product.unit || 'PIECE',
                                  stock: product.stock,
                                  status: product.status || 'ACTIVE',
                                  categoryId: targetCategory ? String(targetCategory.id) : '',
                                  thumbnail: product.thumbnail || '',
                                  imageUrls: extractedUrls,
                                  barcode: product.barcode || ''
                                });
                                setDrawerOpen(true);
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-red-100 bg-white hover:bg-red-50 text-red-600 transition-all cursor-pointer active:scale-95" onClick={() => setDeleteConfirmId(product.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 text-sm font-semibold text-slate-500 select-none bg-slate-50/50">
                <div>Hiển thị bản ghi từ <span className="text-slate-900 font-bold">{currentPage * pageSize + 1}</span> đến <span className="text-slate-900 font-bold">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trên tổng số <span className="text-slate-900 font-bold">{totalElements}</span> mục</div>
                <div className="flex items-center gap-1.5">
                  <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
                  {renderPageNumbers()}
                  <button type="button" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all active:scale-95"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* POPUP MODAL PHÓNG TO HÌNH ẢNH */}
      {zoomImageUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4" onClick={() => setZoomImageUrl(null)}>
          <div className="relative bg-white p-2 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomImageUrl(null)} className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full border-none cursor-pointer active:scale-95 transition-colors z-10"><X className="w-4 h-4" /></button>
            <img src={zoomImageUrl} alt="Zoomed Product" className="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* DRAWER SLIDE-OVER CONTROL */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity" onClick={() => setDrawerOpen(false)}></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <span className="font-black text-base text-slate-900">{isEdit ? 'Cấu hình thông tin sản phẩm' : 'Thêm sản phẩm mới'}</span>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer active:scale-95"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSaveProduct} className="font-semibold flex flex-col h-full gap-5 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tên sản phẩm / mặt hàng</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all" placeholder="Ví dụ: Slurpee Cherry Chai Lớn" />
            </div>

            {isEdit && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mã Barcode sản phẩm</label>
                <input required type="text" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all font-mono" placeholder="Nhập mã Barcode định danh sản phẩm..." />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Giá bán (VND)</label>
                <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all" placeholder="35000" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Số lượng tồn kho</label>
                <input required type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all" placeholder="50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phân nhóm danh mục</label>
                <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all cursor-pointer font-semibold">
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Đơn vị (EnumUnit)</label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all cursor-pointer font-semibold">
                  <option value="PIECE">PIECE (Chiếc/Cái)</option>
                  <option value="BOTTLE">BOTTLE (Chai)</option>
                  <option value="CAN">CAN (Lon)</option>
                  <option value="PACK">PACK (Gói)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trọng lượng (kg)</label>
                <input type="number" step="0.01" min="0" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all" placeholder="0.5" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trạng thái hệ thống</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all cursor-pointer font-semibold">
                  <option value="ACTIVE">ACTIVE (Kinh doanh)</option>
                  <option value="INACTIVE">INACTIVE (Tạm ẩn)</option>
                </select>
              </div>
            </div>

            {/* KHU VỰC 1: UPLOAD & PREVIEW ẢNH ĐẠI DIỆN THUMBNAIL (BẮT BUỘC - 1 ẢNH) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Hình ảnh Thumbnail đại diện chính (*)</label>
              <div className="flex flex-col gap-3">
                {formData.thumbnail ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-emerald-200 group/thumbImg">
                    <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/thumbImg:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <button type="button" onClick={() => setZoomImageUrl(formData.thumbnail)} className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md text-xs"><Eye className="w-3.5 h-3.5" /> Xem ảnh lớn</button>
                    </div>
                    <button type="button" disabled={uploadingThumbnail} onClick={() => setFormData({ ...formData, thumbnail: '' })} className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full border-none cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-500 transition-all group">
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <Upload className="w-6 h-6 text-emerald-500 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-600 font-bold m-0">Nhấp chọn ảnh Thumbnail</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={uploadingThumbnail} />
                  </label>
                )}
              </div>
            </div>

            {/* === KHU VỰC 2: NÂNG CẤP CHỌN VÀ HIỂN THỊ HÀNG LOẠT ẢNH CHI TIẾT (MULTIPLE UPLOAD) === */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bộ sưu tập loạt ảnh chi tiết khác (Chọn được nhiều ảnh)</label>
              <div className="flex flex-col gap-3">
                {/* Khu vực bấm chọn thêm ảnh (Luôn hiện để Admin bấm chọn thêm tiếp) */}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-[#008061]/50 transition-all group">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#008061] transition-colors mb-1" />
                    <p className="text-xs text-slate-600 font-bold m-0">Giữ Ctrl / Quét chọn nhiều file ảnh</p>
                  </div>
                  {/* Bổ sung thuộc tính multiple để nhận diện chọn nhiều file cùng lúc */}
                  <input type="file" accept="image/*" multiple onChange={handleDetailImagesChange} className="hidden" disabled={uploadingDetail} />
                </label>

                {/* Grid layout hiển thị toàn bộ loạt ảnh chi tiết đã up lên Cloudinary */}
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/gridImg">
                        <img src={url} alt={`Detail ${index}`} className="w-full h-full object-cover" />

                        {/* Menu nhỏ đè lên ảnh khi hover để xem bự hoặc bấm xóa */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/gridImg:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-150">
                          <button type="button" onClick={() => setZoomImageUrl(url)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border-none cursor-pointer text-slate-800 hover:bg-slate-100"><Eye className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => handleRemoveDetailImage(index)} className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center border-none cursor-pointer text-white hover:bg-red-700"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả thông tin chi tiết</label>
              <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#008061]/10 focus:border-[#008061] transition-all resize-none text-sm" placeholder="Nhập ghi chú chi tiết hoặc thành phần dinh dưỡng của sản phẩm..." />
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-slate-100 flex-shrink-0">
              <button
                type="submit"
                disabled={uploadingThumbnail || uploadingDetail}
                className="w-full bg-[#008061] hover:bg-[#006c52] text-white font-bold h-11 rounded-xl transition-all cursor-pointer text-sm active:scale-95 border-none flex items-center justify-center disabled:opacity-50"
              >
                {uploadingThumbnail || uploadingDetail ? 'Đang đồng bộ ảnh...' : 'Lưu thông tin sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center font-semibold">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Xóa sản phẩm</h3>
            <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Bạn có chắc chắn muốn gỡ bỏ mặt hàng này khỏi kho? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3 text-sm">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all cursor-pointer border-none">Hủy bỏ</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/10 cursor-pointer border-none active:scale-95">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;