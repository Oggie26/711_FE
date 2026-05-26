import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);

    const status = params.get("status");
    const orderId = params.get("orderId");

    const isSuccess = status === "success";

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);

        if (isSuccess) {
            cartService.clearCart();
        }
    }, [isSuccess]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
            <div
                className={`relative bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center transform transition-all duration-700 ${animate
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-10"
                    }`}
            >
                {isSuccess ? (
                    <>
                        <div className="flex justify-center mb-6">
                            <CheckCircle className="w-24 h-24 text-green-500" />
                        </div>

                        <h1 className="text-4xl font-black text-green-600 mb-4">
                            Thanh toán thành công
                        </h1>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Đơn hàng{" "}
                            <span className="font-bold text-green-600">
                                #{orderId}
                            </span>{" "}
                            đã được thanh toán thành công.
                        </p>

                        <button
                            onClick={() => navigate("/orders")}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                        >
                            Xem đơn hàng
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center mb-6">
                            <XCircle className="w-24 h-24 text-red-500" />
                        </div>

                        <h1 className="text-4xl font-black text-red-500 mb-4">
                            Thanh toán thất bại
                        </h1>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Giao dịch chưa hoàn tất. Vui lòng thử lại.
                        </p>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
                        >
                            Quay lại thanh toán
                        </button>
                    </>
                )}

                <p className="mt-10 text-sm text-gray-400">
                    Cảm ơn bạn đã mua sắm ❤️
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;