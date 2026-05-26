import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Search, Settings, Trash2, Minus, Plus, X, ArrowLeft,
  Heart, Share2, User, LogIn, ChevronDown, LogOut
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import ProductService from '../../service/product/productService';
import CartService from '../../service/cart/cartService';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const searchContainerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
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
        const res = await ProductService.searchProducts(searchTerm, 0, 7);
        const resData = res?.data?.data || res?.data || res || [];
        setSuggestions(resData);
      } catch (error) {
        console.error("Lỗi tải gợi ý:", error);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // --- HÀM LẤY GIỎ HÀNG --
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
      console.error("Lỗi đồng bộ giỏ hàng tại Detail:", e);
    }
  };
  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const response = await ProductService.getProductBySlug(slug);
        const fetchedData = response?.data?.data || response?.data || response;
        setProduct(fetchedData);

        if (fetchedData?.thumbnail) {
          setActiveImage(fetchedData.thumbnail);
        } else if (fetchedData?.images && fetchedData.images.length > 0) {
          setActiveImage(fetchedData.images[0].url);
        }

        if (fetchedData?.categoryId) {
          fetchRelatedProducts(fetchedData.categoryId, fetchedData.id);
        }

        await fetchUserCart();
      } catch (error) {
        toast.error("Không thể tải thông tin chi tiết sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductAndRelated();
  }, [slug]);

  const fetchRelatedProducts = async (categoryId, currentProdId) => {
    setLoadingRelated(true);
    try {
      const res = await ProductService.getProductsByCategory(categoryId, 0, 10);
      const dataResponse = res?.data?.data || res?.data || res || [];
      const filtered = dataResponse.filter(p => p.id !== currentProdId);
      setRelatedProducts(filtered.slice(0, 6));
    } catch (err) {
      console.error("Lỗi tải sản phẩm cùng nhóm từ API:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  // --- XỬ LÝ GIỎ HÀNG & THANH TOÁN ---
  const addToCart = async (prod) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error("Vui lòng đăng nhập để thực hiện thêm vào giỏ hàng!");
      navigate('/login');
      return;
    }

    const idToast = toast.loading(`Đang thêm ${prod.name} vào giỏ...`);
    try {
      await CartService.addProduct(prod.id, 1);
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

      {/* HEADER NAVIGATION CÓ TÍCH HỢP SEARCH */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-10 h-[76px] flex items-center justify-between gap-8">
          <div className="flex flex-col cursor-pointer select-none flex-shrink-0" onClick={() => navigate('/')}>
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

            {/* DROPDOWN SUGGESTIONS BOX */}
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
                          setSearchTerm('');
                          navigate(`/product/${item.id}`);
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
          <span className="py-3 cursor-pointer hover:text-[#008061] whitespace-nowrap" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="py-3 cursor-pointer hover:text-[#008061] whitespace-nowrap">Về chúng tôi</span>
        </div>
      </div>

      {/* BODY CONTAINER */}
      <div className="w-full flex pt-[124px] min-h-screen">
        <main className={`flex-1 transition-all duration-300 px-10 py-12 w-full ${cartOpen ? 'mr-[380px]' : 'mr-0'}`}>
          {loading ? (
            <div className="bg-white rounded-[28px] p-20 flex flex-col justify-center items-center gap-3 text-gray-400 font-semibold text-sm border border-gray-100 shadow-xl">
              <div className="w-6 h-6 border-2 border-[#008061] border-t-transparent rounded-full animate-spin"></div>
              Đang truy xuất thông tin mặt hàng từ 7-Eleven...
            </div>
          ) : !product ? (
            <div className="bg-white rounded-[28px] p-12 text-center border border-gray-100 shadow-xl">
              <p className="text-gray-400 font-bold mb-4">Sản phẩm không tồn tại hoặc đã bị gỡ bỏ!</p>
              <button onClick={() => navigate(-1)} className="px-5 py-2 bg-[#008061] text-white font-bold rounded-lg border-none cursor-pointer">Quay lại cửa hàng</button>
            </div>
          ) : (
            <div className="flex flex-col gap-12 w-full">
              {/* KHỐI BOX CHI TIẾT SẢN PHẨM */}
              <div className="bg-white rounded-[28px] p-6 sm:p-10 shadow-xl border border-gray-100 w-full">
                <button
                  onClick={() => navigate(-1)}
                  className="mb-8 text-[#008061] hover:text-[#006c52] font-semibold flex items-center justify-center gap-1 hover:bg-[#008061]/5 border border-transparent hover:border-[#008061]/10 px-4 h-9 rounded-lg transition-all cursor-pointer bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 text-[#008061]" /> Quay lại
                </button>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 w-full">
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <div className="rounded-2xl overflow-hidden bg-gray-50 h-[380px] border border-gray-100 shadow-sm">
                      <img src={activeImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>

                    {product.images && product.images.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {product.thumbnail && (
                          <div
                            className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-white p-1 ${activeImage === product.thumbnail ? 'border-[#008061] shadow-sm' : 'border-gray-200/70 hover:border-gray-400'}`}
                            onClick={() => setActiveImage(product.thumbnail)}
                          >
                            <img src={product.thumbnail} alt="Main Thumbnail" className="w-full h-full object-cover rounded-lg" />
                          </div>
                        )}

                        {product.images.map((imgObj) => (
                          <div
                            key={imgObj.id}
                            className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-white p-1 ${activeImage === imgObj.url ? 'border-[#008061] shadow-sm' : 'border-gray-200/70 hover:border-gray-400'}`}
                            onClick={() => setActiveImage(imgObj.url)}
                          >
                            <img src={imgObj.url} alt="Product Detail" className="w-full h-full object-cover rounded-lg" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-[#008061]/10 border border-[#008061]/20 text-[#008061] tracking-wider">
                          {product.categoryName || 'Mặt hàng'}
                        </span>
                        <div className="flex gap-2">
                          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 bg-transparent border-none cursor-pointer">
                            <Heart className="w-5 h-5 text-gray-400 hover:text-rose-400" />
                          </button>
                          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 bg-transparent border-none cursor-pointer">
                            <Share2 className="w-5 h-5 text-gray-400 hover:text-[#008061]" />
                          </button>
                        </div>
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-wide leading-tight">
                        {product.name}
                      </h1>

                      {product.barcode && (
                        <p className="text-xs text-gray-400 font-mono mb-4">Barcode: {product.barcode}</p>
                      )}

                      <p className="text-3xl font-extrabold text-[#008061] mb-6">
                        {(product.price || 0).toLocaleString()} VND
                      </p>

                      <div className="h-px bg-gray-100 w-full mb-6"></div>

                      <p className="text-gray-500 text-sm leading-relaxed mb-6 whitespace-pre-line">
                        {product.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="flex flex-col gap-1 text-sm">
                        {product.weight && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-medium">Trọng lượng:</span>
                            <span className="text-gray-700 font-bold">{product.weight} gam</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-medium">Tình trạng:</span>
                          {product.stock > 0 ? (
                            <span className="text-[#008061] font-bold">Còn hàng (Tồn kho: {product.stock})</span>
                          ) : (
                            <span className="text-red-500 font-bold">Tạm hết hàng</span>
                          )}
                        </div>
                      </div>

                      <button
                        disabled={product.stock <= 0}
                        className="w-36 bg-[#008061] hover:bg-[#00a37c] text-white border-none h-9 text-xs font-bold shadow-md shadow-[#008061]/10 hover:scale-[1.02] transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-3 select-none"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">Sản phẩm cùng danh mục</h3>
                  <span className="text-gray-400 text-xs font-bold hover:text-[#008061] cursor-pointer transition-colors">Xem tất cả</span>
                </div>

                {loadingRelated ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-medium">Đang tìm các mặt hàng liên quan...</div>
                ) : relatedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-medium">Không tìm thấy sản phẩm liên quan nào khác.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
                    {relatedProducts.map(item => {
                      const relatedImg = item.thumbnail || (item.images && item.images.length > 0 ? item.images[0].url : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400');
                      return (
                        <div key={item.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-[#008061]/50 hover:shadow-lg transition-all group flex flex-col">
                          <div className="cursor-pointer flex-1 flex flex-col" onClick={() => navigate(`/product/${item.id}`)}>
                            <div className="w-full aspect-square mb-2 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                              <img src={relatedImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg" />
                            </div>
                            <h4 className="text-gray-800 font-bold text-[11px] mb-1 line-clamp-2 h-7 hover:text-[#008061] transition-colors leading-snug">{item.name}</h4>
                            <p className="text-[#e4252b] font-bold text-xs mb-2">{(item.price || 0).toLocaleString()} Đ</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="mt-auto w-full flex items-center justify-center gap-1.5 bg-white text-[#008061] font-semibold py-2 text-xs rounded-md border border-[#008061] hover:bg-[#008061] hover:text-white transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Mua ngay
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed top-[124px] right-0 bottom-0 w-[380px] bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Giỏ Hàng Của Bạn</h2>
            <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
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
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex justify-between items-center mb-2 text-sm text-gray-600"><span>Tạm tính</span><span className="font-semibold">{subtotal.toLocaleString()} VND</span></div>
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

export default ProductDetail;