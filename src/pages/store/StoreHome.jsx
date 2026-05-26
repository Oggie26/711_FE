import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Search, Settings, Trash2, Minus, Plus, X, Truck,
  Coffee, Cookie, Utensils, Milk, Smile, Star, Headphones,
  User, LogIn, ChevronDown, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import ProductService from '../../service/product/productService';
import CategoryService from '../../service/category/categoryService';
import CartService from '../../service/cart/cartService';

const categoryStyleMap = {
  'Đồ uống': { icon: Coffee, bg: 'bg-[#008061]' },
  'Đồ ăn vặt': { icon: Cookie, bg: 'bg-[#f58220]' },
  'Đồ ăn liền': { icon: Utensils, bg: 'bg-[#e4252b]' },
  'Cà phê': { icon: Coffee, bg: 'bg-[#795548]' },
  'Sữa': { icon: Milk, bg: 'bg-[#2196f3]' },
  'Cá nhân': { icon: Smile, bg: 'bg-[#9c27b0]' },
};

const StorePage = () => {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchUserCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const response = await CartService.getCart();
      const cartData = response?.data?.data || response?.data || response;

      if (cartData?.id) {
        setCartId(cartData.id);
      }

      const items = cartData?.items || [];

      const mappedItems = items.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        qty: item.quantity,
        img: item.thumbnail || 'https://via.placeholder.com/400'
      }));

      setCartItems(mappedItems);
    } catch (e) {
      console.error("Lỗi đồng bộ giỏ hàng:", e);
    }
  };

  useEffect(() => {
    const initStoreData = async () => {
      setLoading(true);
      try {
        const [catResponse, prodResponse] = await Promise.all([
          CategoryService.getAllCategories(),
          ProductService.searchProducts('', 0, 24)
        ]);
        setCategories(catResponse || []);
        setProducts(prodResponse?.data?.data || prodResponse?.data || prodResponse || []);
        await fetchUserCart();
      } catch (error) {
        toast.error("Không thể kết nối đồng bộ dữ liệu cửa hàng!");
      } finally {
        setLoading(false);
      }
    };
    initStoreData();

    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await ProductService.searchProducts(searchTerm, 0, 7); // Lấy nhanh 7 sản phẩm khớp nhất làm gợi ý
        const resData = res?.data?.data || res?.data || res || [];
        setSuggestions(resData);
      } catch (error) {
        console.error("Lỗi tải gợi ý:", error);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setLoading(true);
    try {
      const prodResponse = await ProductService.searchProducts(searchTerm, 0, 24);
      const resData = prodResponse?.data?.data || prodResponse?.data || prodResponse || [];
      setProducts(resData);
    } catch (error) {
      toast.error("Tìm kiếm sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async product => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
      return;
    }

    const idToast = toast.loading(`Đang thêm ${product.name} vào giỏ...`);
    try {
      await CartService.addProduct(product.id, 1);
      await fetchUserCart();
      setCartOpen(true);
      toast.success("Đã thêm vào giỏ hàng hệ thống! 🛒", { id: idToast });
    } catch (error) {
      toast.error("Thêm vào giỏ hàng thất bại!", { id: idToast });
    }
  };

  const updateQty = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      await CartService.updateQuantity(productId, newQty);
      await fetchUserCart();
    } catch (e) {
      toast.error("Không thể cập nhật số lượng!");
    }
  };

  const removeItem = async (productId) => {
    const idToast = toast.loading("Đang gỡ bỏ sản phẩm...");
    try {
      await CartService.removeItems(productId);
      await fetchUserCart();
      toast.success("Đã xóa khỏi giỏ hàng thành công!", { id: idToast });
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!", { id: idToast });
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error("Hệ thống yêu cầu đăng nhập trước khi tiến hành thanh toán đơn hàng!");
      setCartOpen(false);
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống! Vui lòng chọn mua sản phẩm.");
      return;
    }

    try {
      const response1 = await CartService.getCart();
      const cartData = response1?.data?.data || response1?.data || response1;
      const finalCartId = cartData?.cartId || cartData?.id;

      if (!finalCartId) {
        toast.error("Lỗi dữ liệu giỏ hàng. Vui lòng tải lại trang!");
        return;
      }

      toast.success("Đang chuyển đến trang thanh toán...");
      navigate(`/checkout?cartId=${finalCartId}`);

    } catch (error) {
      console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
      toast.error("Không thể lấy dữ liệu giỏ hàng lúc này!");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-800 font-sans w-full flex flex-col overflow-x-hidden">
      <Toaster position="bottom-right" reverseOrder={false} containerStyle={{ zIndex: 99999 }} />

      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-10 h-[76px] flex items-center justify-between gap-8">
          <div className="flex flex-col cursor-pointer select-none flex-shrink-0" onClick={() => { setSearchTerm(''); window.location.reload(); }}>
            <div className="flex items-center">
              <span className="text-3xl font-black text-[#e4252b] tracking-tighter">7</span>
              <span className="text-3xl font-black text-[#008061] tracking-tighter">-ELEVEn</span>
            </div>
            <span className="text-[#e4252b] text-[11px] font-bold italic -mt-1 ml-1 font-serif">Luôn mở cửa</span>
          </div>

          {/* Ô TÌM KIẾM ĐỘNG KIỂU SHOPEE */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                className="block w-full pl-4 pr-12 py-2.5 rounded-md text-sm bg-white border border-gray-200 focus:outline-none focus:border-[#008061] transition-all"
                placeholder="Tìm sản phẩm, thức ăn nhanh tại 7-Eleven..."
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-4 flex items-center bg-transparent border-none text-gray-400 hover:text-[#008061] cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* === DROPDOWN SUGGESTIONS BOX CHUẨN SHOPEE === */}
            {showSuggestions && searchTerm.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto py-2">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-400 font-medium">Không tìm thấy tên gợi ý phù hợp...</div>
                ) : (
                  suggestions.map((item) => {
                    const itemImg = item.thumbnail || (item.images?.[0]?.url) || 'https://via.placeholder.com/150';
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/product/${item.id}`); // Click gợi ý bay thẳng vào trang chi tiết
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-4 cursor-pointer transition-colors border-b border-gray-50/50 last:border-none"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img src={itemImg} alt="" className="w-8 h-8 object-cover rounded-md border border-gray-100 flex-shrink-0" />
                          <span className="text-xs font-bold text-gray-700 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-black text-[#008061]">{(item.price || 0).toLocaleString()} Đ</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Kho: {item.stock}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all ${cartOpen ? 'border-[#e4252b] bg-red-50 text-[#e4252b]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
              onClick={() => setCartOpen(!cartOpen)}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e4252b] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">Giỏ hàng ({cartItems.length})</span>
            </button>

            {localStorage.getItem('accessToken') ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-100 transition-all">
                  <User className="w-4 h-4 text-[#008061]" />
                  Tài khoản <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#008061]" /> Thông tin cá nhân
                  </button>
                  <button onClick={() => { localStorage.removeItem('accessToken'); window.location.reload(); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm font-bold text-white bg-[#008061] px-6 py-2.5 rounded-lg hover:bg-[#006c52] shadow-sm transition-all">
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            )}
          </div>
        </div>

        <div className="w-full px-10 flex gap-8 text-[13px] font-bold text-gray-600 uppercase tracking-wide overflow-x-auto [scrollbar-width:none]">
          <span className="text-[#008061] border-b-[3px] border-[#008061] py-3 cursor-pointer whitespace-nowrap">Trang chủ</span>
          <span className="py-3 cursor-pointer hover:text-[#008061] whitespace-nowrap">Về chúng tôi</span>
        </div>
      </div>


      <div className="w-full flex pt-[124px] min-h-screen">
        <main className={`flex-1 transition-all duration-300 ${cartOpen ? 'mr-[380px]' : 'mr-0'}`}>
          <div className="p-12 w-full">

            <div className="relative w-full rounded-2xl bg-[#fff8eb] overflow-hidden mb-10 border border-[#fdecd5]">
              <div className="relative z-10 flex flex-col md:flex-row items-center px-8 py-12 md:py-14">
                <div className="flex-1">
                  <span className="text-[#008061] font-bold text-[11px] tracking-widest uppercase mb-3 block">CHÀO MỪNG ĐẾN VỚI 7-ELEVEN</span>
                  <h1 className="text-4xl lg:text-5xl font-black text-gray-800 leading-[1.1] mb-4">
                    Đồ Uống Tươi Mát & <br />
                    <span className="text-[#f58220]">Thực Phẩm Hàng Ngày</span>
                  </h1>
                  <p className="text-gray-600 font-medium mb-8 max-w-sm text-[13px] leading-relaxed">
                    Đặt hàng trực tuyến các sản phẩm yêu thích và nhận giao hàng tận nơi nhanh chóng.
                  </p>
                  <button className="px-6 py-2.5 bg-[#008061] text-white font-semibold rounded-md hover:bg-[#006c52] transition-colors flex items-center gap-2 text-sm shadow-sm">
                    Mua Ngay <span className="text-lg leading-none">→</span>
                  </button>
                </div>

                <div className="flex-1 relative h-[250px] hidden md:block">
                  <div className="absolute right-0 bottom-0 w-full h-full flex items-end justify-end gap-3 pr-4">
                    <img src="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=400" alt="Food 1" className="w-32 h-40 object-cover rounded-xl border-4 border-white shadow-xl -rotate-6 z-10" />
                    <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400" alt="Food 2" className="w-36 h-52 object-cover rounded-xl border-4 border-white shadow-xl z-20" />
                    <img src="https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=400" alt="Food 3" className="w-28 h-48 object-cover rounded-xl border-4 border-white shadow-xl rotate-6 z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* DANH MỤC */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Mua Sắm Theo Danh Mục</h3>
                <span className="text-gray-500 text-xs font-semibold hover:text-[#008061] cursor-pointer">Xem tất cả</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#008061]/30 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-3 shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
                      <img src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150'} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-1">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SẢN PHẨM MÀN HÌNH CHÍNH */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Sản Phẩm Cửa Hàng</h3>
                {searchTerm && (
                  <span onClick={() => { setSearchTerm(''); window.location.reload(); }} className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer">
                    Hủy lọc tìm kiếm [X]
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-14 bg-white rounded-xl border border-gray-100 p-8 text-gray-400 font-semibold text-sm">
                    <div className="w-6 h-6 border-2 border-[#008061] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Đang tải danh sách sản phẩm...
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-14 bg-white rounded-xl border border-gray-100 p-8 text-gray-400 font-bold text-sm">
                    😞 Không tìm thấy mặt hàng nào phù hợp với từ khóa!
                  </div>
                ) : (
                  products.map(product => {
                    const finalImg = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400');

                    return (
                      <div key={product.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#008061]/50 hover:shadow-lg transition-all group flex flex-col">
                        <div
                          className="cursor-pointer flex-1 flex flex-col"
                          onClick={() => navigate(`/product/${product.slug}`)}
                        >
                          <div className="w-full aspect-square mb-3 bg-white flex items-center justify-center p-1 overflow-hidden rounded-lg">
                            <img src={finalImg} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg" />
                          </div>

                          <h4 className="text-gray-800 font-bold text-xs mb-1 line-clamp-2 h-8 hover:text-[#008061] transition-colors">{product.name}</h4>
                          <p className="text-[#e4252b] font-bold text-[13px] mb-0.5">{(product.price || 0).toLocaleString()} VND</p>
                          <p className="text-[#008061] text-[10px] font-bold mb-3">Tồn kho: {product.stock}</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="mt-auto w-full flex items-center justify-center gap-1.5 bg-white text-[#008061] font-semibold py-2 text-xs rounded-md border border-[#008061] hover:bg-[#008061] hover:text-white transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Thêm vào giỏ
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* FEATURES FOOTER */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-gray-200 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 text-[#008061]"><Truck className="w-5 h-5" /></div>
                <div><h5 className="text-[12px] font-bold text-gray-800">Giao Hàng Nhanh</h5><p className="text-[10px] text-gray-500">Giao tận cửa nhà bạn</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 text-[#008061]"><Star className="w-5 h-5" /></div>
                <div><h5 className="text-[12px] font-bold text-gray-800">Sản Phẩm Chất Lượng</h5><p className="text-[10px] text-gray-500">100% hàng chính hãng</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 text-[#008061]"><ShoppingCart className="w-5 h-5" /></div>
                <div><h5 className="text-[12px] font-bold text-gray-800">Giá Tốt Nhất</h5><p className="text-[10px] text-gray-500">Giá cả phải chăng mỗi ngày</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 text-[#008061]"><Headphones className="w-5 h-5" /></div>
                <div><h5 className="text-[12px] font-bold text-gray-800">Hỗ Trợ 24/7</h5><p className="text-[10px] text-gray-500">Chúng tôi luôn sẵn sàng hỗ trợ</p></div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400 pb-6">
              © 2026 7-Eleven Vietnam. Đã đăng ký bản quyền.
            </div>
          </div>
        </main>

        {/* SIDEBAR GIỎ HÀNG THỜI GIAN THỰC */}
        <aside
          className={`fixed top-[124px] right-0 bottom-0 w-[380px] bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Giỏ Hàng Của Bạn</h2>
            <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-sm">Chưa có sản phẩm</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center">
                    <img src={item.img} alt={item.name} className="max-w-full max-h-full object-contain rounded-md" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[13px] font-bold text-gray-800 leading-tight pr-2">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[#e4252b] font-bold text-xs mt-1">{(item.price || 0).toLocaleString()} VND</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button onClick={() => updateQty(item.id, item.qty, -1)} className="w-7 h-7 flex justify-center items-center text-gray-500 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-semibold w-7 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty, 1)} className="w-7 h-7 flex justify-center items-center text-gray-500 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{((item.price || 0) * item.qty).toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
              <span>Tạm tính</span>
              <span className="font-semibold">{subtotal.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-800 text-sm">Tổng cộng</span>
              <span className="text-xl font-black text-[#e4252b]">{total.toLocaleString()} VND</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-md bg-[#008061] text-white text-sm font-bold hover:bg-[#006c52] transition-colors mb-3 cursor-pointer"
            >
              Thanh Toán →
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default StorePage;