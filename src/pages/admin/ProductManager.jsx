import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, AlertTriangle, CheckCircle2, Upload, ChevronLeft, ChevronRight, Maximize2, Eye, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Barcode from 'react-barcode';
import ProductService from '../../service/product/productService';
import CategoryService from '../../service/category/categoryService';
import { uploadToCloudinary } from '../../service/cloudinaryService';

const ProductManager = () => {
  const [allFilteredProducts, setAllFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState(''); // State mới cho lọc Category

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [globalStats, setGlobalStats] = useState({ active: 0, outOfStock: 0 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', weight: '', unit: 'PIECE',
    stock: '', status: 'ACTIVE', categoryId: '', thumbnail: '', imageUrls: [], barcode: ''
  });

  useEffect(() => {
    fetchAllCategories();
    applyFilters();
  }, []);

  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const paginatedData = allFilteredProducts.slice(startIndex, startIndex + pageSize);
    setProducts(paginatedData);
  }, [currentPage, allFilteredProducts]);

  const fetchAllCategories = async () => {
    try {
      const apiResponse = await CategoryService.getAllCategories();
      const catList = apiResponse || apiResponse || [];
      setCategories(catList);
      if (catList.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: String(catList[0].id) }));
      }
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  // 🔥 HÀM XỬ LÝ LỌC DỮ LIỆU (TỪ KHÓA, GIÁ, DANH MỤC) BẰNG FRONTEND
  const applyFilters = async () => {
    setLoading(true);
    try {
      // 1. Ép Backend trả toàn bộ dữ liệu (limit 9999) theo từ khóa
      const res = await ProductService.searchProducts(keyword, 0, 9999);
      const pageInfo = res?.data || res || {};
      const rawProducts = pageInfo.content || pageInfo.data || (Array.isArray(pageInfo) ? pageInfo : []);

      // 2. JS tự động lọc Giá và Category
      const finalData = rawProducts.filter(p => {
        const price = p.price || 0;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;

        const isPriceMatch = price >= min && price <= max;

        // Lấy ID category của sản phẩm (hỗ trợ cả 2 chuẩn response phổ biến)
        const matchedCategory = categories.find(c => c.name === p.category?.name || c.name === p.categoryName);
        const productCatId = String(p.category?.id || p.categoryId || matchedCategory?.id || '');
        const isCategoryMatch = filterCategoryId === '' || productCatId === filterCategoryId;

        return isPriceMatch && isCategoryMatch;
      });

      // 3. Thống kê toàn hệ thống dựa trên kết quả lọc
      let activeCount = 0;
      let outOfStockCount = 0;
      finalData.forEach(p => {
        if (p.status === 'ACTIVE') activeCount++;
        if (p.stock === 0) outOfStockCount++;
      });
      setGlobalStats({ active: activeCount, outOfStock: outOfStockCount });

      // 4. Lưu trữ và cấu hình phân trang
      setAllFilteredProducts(finalData);
      setTotalElements(finalData.length);
      setTotalPages(Math.ceil(finalData.length / pageSize) || 1);
      setCurrentPage(0);

    } catch (error) {
      toast.error('Lỗi khi tải và lọc dữ liệu từ máy chủ!');
    } finally {
      setLoading(false);
    }
  };

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
        const idToast = toast.loading('Đang tải ảnh đại diện lên hệ thống...');
        try {
          const secureUrl = await uploadToCloudinary(reader.result);
          setFormData(prev => ({ ...prev, thumbnail: secureUrl }));
          toast.success('Tải ảnh đại diện thành công!', { id: idToast });
        } catch (error) {
          toast.error('Lỗi tải ảnh đại diện!', { id: idToast });
        } finally {
          setUploadingThumbnail(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingDetail(true);
    const idToast = toast.loading(`Đang tải ${files.length} ảnh mô tả lên hệ thống...`);
    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve) => {
          if (file.size > 2 * 1024 * 1024) return resolve(null);
          const reader = new FileReader();
          reader.onloadend = async () => {
            try { resolve(await uploadToCloudinary(reader.result)); }
            catch (err) { resolve(null); }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });
      const validUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...validUrls] }));
      toast.success(`Tải lên thành công!`, { id: idToast });
    } catch (error) {
      toast.error('Lỗi tải ảnh mô tả!', { id: idToast });
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleRemoveDetailImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev, imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (uploadingThumbnail || uploadingDetail) return toast.error('Vui lòng đợi tải ảnh hoàn tất!');
    if (!formData.thumbnail) return toast.error('Cần chọn hình ảnh Thumbnail bắt buộc!');

    const idToast = toast.loading(isEdit ? 'Đang cập nhật sản phẩm...' : 'Đang thêm sản phẩm mới...');
    try {
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
        image: formData.imageUrls.map(url => ({ image: url }))
      };

      if (isEdit && selectedProductId) {
        await ProductService.updateProduct(selectedProductId, { ...payload, barcode: formData.barcode });
        toast.success('Cập nhật thành công! ✨', { id: idToast });
      } else {
        await ProductService.createProduct(payload);
        toast.success('Thêm thành công! 🎉', { id: idToast });
      }

      setDrawerOpen(false);
      applyFilters();
    } catch (error) {
      toast.error('Thao tác thất bại!', { id: idToast });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const delToast = toast.loading('Đang gỡ bỏ sản phẩm...');
    try {
      await ProductService.deleteProduct(deleteConfirmId);
      toast.success('Đã xóa sản phẩm thành công!', { id: delToast });
      setDeleteConfirmId(null);
      applyFilters();
    } catch (error) {
      toast.error('Không thể xóa sản phẩm này!', { id: delToast });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => setCurrentPage(i)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all cursor-pointer border ${currentPage === i ? 'bg-[#008061] text-white border-[#008061] shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >{i + 1}</button>
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
      default: return 'sp';
    }
  };

  return (
    <div className="w-full">
      <Toaster position="bottom-right" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Theo dõi và cập nhật danh mục hàng hóa trong kho</p>
        </div>
        <button onClick={() => { setIsEdit(false); setSelectedProductId(null); setFormData({ name: '', description: '', price: '', weight: '', unit: 'PIECE', stock: '', status: 'ACTIVE', categoryId: categories[0]?.id ? String(categories[0].id) : '', thumbnail: '', imageUrls: [], barcode: '' }); setDrawerOpen(true); }} className="bg-[#008061] hover:bg-[#006c52] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"><Plus className="w-4 h-4" /> Thêm sản phẩm</button>
      </div>

      {/* BOX THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><Package className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng số dữ liệu lọc được</p><p className="text-lg font-black text-slate-900">{totalElements} mặt hàng</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đang hoạt động</p><p className="text-lg font-black text-slate-900">{globalStats.active} mặt hàng</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hết hàng (Tồn = 0)</p><p className="text-lg font-black text-slate-900">{globalStats.outOfStock} mặt hàng</p></div>
        </div>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3 mb-6 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Tìm kiếm theo tên, mô tả hoặc barcode..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#008061] transition-all text-sm" />
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
          {/* Lọc danh mục */}
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl py-2.5 px-3 outline-none focus:border-[#008061] transition-all cursor-pointer text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Lọc giá */}
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Từ giá (VND)" className="w-28 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl py-2.5 px-3 outline-none focus:border-[#008061] transition-all text-sm" />
          <span className="text-slate-400 font-bold">-</span>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} placeholder="Đến giá (VND)" className="w-28 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl py-2.5 px-3 outline-none focus:border-[#008061] transition-all text-sm" />

          <button onClick={applyFilters} className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-[42px] px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all w-full md:w-auto justify-center"><Filter className="w-4 h-4" /> Lọc</button>
        </div>
      </div>

      {/* BẢNG SẢN PHẨM */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-slate-400 font-semibold gap-2"><div className="w-5 h-5 border-2 border-[#008061] border-t-transparent rounded-full animate-spin"></div>Đang xử lý dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Barcode</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Đơn giá</th>
                  <th className="px-6 py-4">Tồn kho</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                {products.map(product => {
                  const currentImg = product.thumbnail || product.thumbnailUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100';
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 cursor-zoom-in group/img" onClick={() => setZoomImageUrl(currentImg)}>
                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden relative">
                          <img src={currentImg} alt="Thumb" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"><Maximize2 className="w-3 h-3 text-white" /></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                      <td className="px-6 py-4">
                        {product.barcode ? <div className="bg-white p-1 rounded border border-slate-200 inline-block"><Barcode value={product.barcode} format="CODE128" height={26} width={1.1} fontSize={9} margin={0} /></div> : <span className="text-slate-400 italic text-xs">Chưa sinh mã</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{product.category?.name || product.categoryName}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{(product.price || 0).toLocaleString()} ₫</td>
                      <td className="px-6 py-4">{product.stock} {getUnitLabel(product.unit)}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wide ${product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{product.status === 'ACTIVE' ? 'Kinh doanh' : 'Tạm ẩn'}</span></td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => {
                            setSelectedProductId(product.id); setIsEdit(true);
                            const targetCategoryId = product.category?.id || categories.find(c => c.name === product.categoryName)?.id;
                            setFormData({
                              name: product.name, description: product.description || '', price: product.price, weight: product.weight || '', unit: product.unit || 'PIECE',
                              stock: product.stock, status: product.status || 'ACTIVE', categoryId: targetCategoryId ? String(targetCategoryId) : '',
                              thumbnail: product.thumbnail || product.thumbnailUrl || '', imageUrls: product.images ? product.images.map(img => img.url || img.image) : [], barcode: product.barcode || ''
                            });
                            setDrawerOpen(true);
                          }} className="w-8 h-8 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirmId(product.id)} className="w-8 h-8 bg-white border border-red-100 rounded-xl hover:bg-red-50 text-red-600 flex items-center justify-center cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="px-6 py-4 flex justify-between border-t border-slate-100 items-center bg-slate-50/50">
              <span className="text-sm font-semibold text-slate-500">Hiển thị <b className="text-slate-900">{totalElements === 0 ? 0 : currentPage * pageSize + 1}</b> đến <b className="text-slate-900">{Math.min((currentPage + 1) * pageSize, totalElements)}</b> trên tổng <b className="text-slate-900">{totalElements}</b> mục</span>
              <div className="flex gap-1.5 items-center">
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)} className="w-9 h-9 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
                {renderPageNumbers()}
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)} className="w-9 h-9 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DRAWER FORM NHẬP LIỆU */}
      {drawerOpen && (
        <div className={`fixed inset-0 z-50 flex justify-end`}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="w-full sm:w-[500px] bg-white h-full relative z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="font-black text-slate-900 m-0">{isEdit ? 'Cấu hình thông tin sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 border-none cursor-pointer transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-5 text-sm font-semibold text-slate-600">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tên sản phẩm</label>
                  <input required placeholder="Ví dụ: Slurpee Cherry Chai Lớn" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] transition-colors" />
                </div>

                {isEdit && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mã Barcode định danh</label>
                    <input required placeholder="Nhập Barcode..." value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] font-mono transition-colors" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Giá bán (VND)</label>
                    <input required type="number" min="0" placeholder="35000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Số lượng tồn kho</label>
                    <input required type="number" min="0" placeholder="50" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phân nhóm danh mục</label>
                    <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] cursor-pointer transition-colors text-slate-800">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Đơn vị tính</label>
                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] cursor-pointer transition-colors text-slate-800">
                      <option value="PIECE">PIECE (Chiếc/Cái)</option>
                      <option value="BOTTLE">BOTTLE (Chai)</option>
                      <option value="CAN">CAN (Lon)</option>
                      <option value="PACK">PACK (Gói)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trọng lượng (Gam)</label>
                    <input type="number" step="0.01" min="0" placeholder="0.5" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trạng thái hệ thống</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] cursor-pointer transition-colors text-slate-800">
                      <option value="ACTIVE">ACTIVE (Kinh doanh)</option>
                      <option value="INACTIVE">INACTIVE (Tạm ẩn)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Ảnh Thumbnail chính (*)</label>
                  {formData.thumbnail ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-emerald-200 group/thumbImg">
                      <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/thumbImg:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => setZoomImageUrl(formData.thumbnail)} className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold border-none cursor-pointer flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Xem ảnh</button>
                      </div>
                      <button type="button" disabled={uploadingThumbnail} onClick={() => setFormData({ ...formData, thumbnail: '' })} className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full border-none cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-500 transition-all group">
                      <Upload className="w-6 h-6 text-emerald-500 mb-2 animate-pulse" />
                      <p className="text-xs text-slate-600 font-bold m-0">Nhấp chọn ảnh Thumbnail</p>
                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={uploadingThumbnail} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bộ sưu tập ảnh chi tiết</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-[#008061]/50 transition-all group mb-3">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#008061] transition-colors mb-1" />
                    <p className="text-xs text-slate-600 font-bold m-0">Quét chọn nhiều file ảnh</p>
                    <input type="file" accept="image/*" multiple onChange={handleDetailImagesChange} className="hidden" disabled={uploadingDetail} />
                  </label>
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/gridImg">
                          <img src={url} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/gridImg:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            <button type="button" onClick={() => setZoomImageUrl(url)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center cursor-pointer border-none text-slate-800"><Eye className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleRemoveDetailImage(index)} className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer border-none text-white"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ghi chú & Mô tả chi tiết</label>
                  <textarea required rows="4" placeholder="Nhập thông tin sản phẩm..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#008061] transition-colors resize-none" />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100">
              <button onClick={handleSaveProduct} disabled={uploadingThumbnail || uploadingDetail} className="w-full bg-[#008061] hover:bg-[#006c52] text-white p-3.5 rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50 border-none shadow-md shadow-[#008061]/20">
                {uploadingThumbnail || uploadingDetail ? 'Đang đồng bộ ảnh...' : isEdit ? 'Cập nhật thay đổi' : 'Xác nhận thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO ẢNH & MODAL XÓA */}
      {zoomImageUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4" onClick={() => setZoomImageUrl(null)}>
          <div className="relative bg-white p-2 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomImageUrl(null)} className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full cursor-pointer z-10 border-none"><X className="w-4 h-4" /></button>
            <img src={zoomImageUrl} alt="Zoomed Product" className="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center font-semibold">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Xóa sản phẩm</h3>
            <p className="text-slate-500 text-xs font-medium mb-6">Bạn có chắc chắn muốn gỡ bỏ mặt hàng này khỏi kho? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3 text-sm">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all cursor-pointer border-none">Hủy bỏ</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/10 cursor-pointer border-none">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;