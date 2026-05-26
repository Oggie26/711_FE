import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, ShieldCheck, ChevronLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OrderService from '../../service/order/orderService';
import CartService from '../../service/cart/cartService';

const Checkout = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const cartId = searchParams.get('cartId');

    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cartItems, setCartItems] = useState([]);
    const [subTotal, setSubTotal] = useState(0);

    useEffect(() => {
        if (!cartId) {
            toast.error("Không tìm thấy thông tin giỏ hàng!");
            navigate('/');
            return;
        }

        const fetchCartDetails = async () => {
            setIsLoadingCart(true);
            try {
                const response = await CartService.getCart();
                const cartData = response?.data?.data || response?.data || response;
                const items = cartData?.items || [];
                setCartItems(items);
                const calculatedTotal = items.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
                setSubTotal(calculatedTotal);

            } catch (error) {
                console.error("Lỗi tải giỏ hàng:", error);
                toast.error("Không thể tải thông tin giỏ hàng!");
                navigate('/');
            } finally {
                setIsLoadingCart(false);
            }
        };

        fetchCartDetails();
    }, [cartId, navigate]);

    const shippingFee = 0;
    const totalAmount = subTotal + shippingFee;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống!");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await OrderService.createOrder(cartId, paymentMethod);
            console.log("Full API Response thực tế:", response);

            const result = response?.data?.data || response?.data || response;
            const paymentUrl = result?.paymentUrl || response?.paymentUrl;

            if (paymentMethod === 'VNPAY' && paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }
            if (paymentMethod === 'CASH') {
                toast.success("Đặt hàng thành công!");
                navigate("/")
            }

        } catch (error) {
            console.error("Lỗi đặt hàng chi tiết:", error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.data?.message ||
                "Có lỗi xảy ra khi đặt hàng!";
            toast.error(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };
    if (isLoadingCart) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500 flex-col gap-3">
                <div className="w-8 h-8 border-4 border-[#008061] border-t-transparent rounded-full animate-spin"></div>
                Đang tải thông tin thanh toán...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thanh toán đơn hàng</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-5 h-5 text-[#008061]" />
                                <h2 className="text-lg font-black text-slate-800">Phương thức thanh toán</h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-[#008061] bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${paymentMethod === 'CASH' ? 'bg-[#008061] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Thanh toán tiền mặt (CASH)</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán tại quầy</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CASH' ? 'border-[#008061]' : 'border-slate-300'}`}>
                                        {paymentMethod === 'CASH' && <div className="w-2.5 h-2.5 rounded-full bg-[#008061]" />}
                                    </div>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('VNPAY')}
                                    className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${paymentMethod === 'VNPAY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Thanh toán VNPAY</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán qua ví điện tử VNPAY</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VNPAY' ? 'border-blue-600' : 'border-slate-300'}`}>
                                        {paymentMethod === 'VNPAY' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[420px]">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-slate-800">Tóm tắt đơn hàng</h2>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.id || item.productId} className="flex gap-3 items-center">
                                        <img
                                            src={item.productThumbnail || item.thumbnail || 'https://via.placeholder.com/60'}
                                            alt={item.productName || item.name}
                                            className="w-14 h-14 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{item.productName || item.name}</p>
                                            <p className="text-xs font-semibold text-slate-500 mt-1">{item.price?.toLocaleString()} ₫ <span className="mx-1">x</span> {item.quantity}</p>
                                        </div>
                                        <p className="font-black text-sm text-[#008061] flex-shrink-0">
                                            {(item.price * item.quantity).toLocaleString()} ₫
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-slate-100 w-full mb-5"></div>

                            <div className="flex flex-col gap-3 mb-6 text-sm">
                                <div className="flex justify-between text-slate-600 font-semibold">
                                    <span>Tạm tính ({cartItems.length} món)</span>
                                    <span>{subTotal.toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-4 border-t border-slate-100">
                                    <span className="font-bold text-slate-800 text-base">Tổng thanh toán</span>
                                    <span className="font-black text-red-600 text-xl">{totalAmount.toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center gap-2 bg-[#008061] text-white py-4 rounded-xl font-bold hover:bg-[#006c52] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                            >
                                {isProcessing ? (
                                    <span className="animate-pulse">Đang xử lý...</span>
                                ) : (
                                    <>
                                        Thanh toán ngay <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;