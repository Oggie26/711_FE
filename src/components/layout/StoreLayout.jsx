import React, { useState } from 'react';
import { Layout, Button, Badge, Drawer } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Store, User, Settings, CreditCard, Minus, Plus } from 'lucide-react';

const { Header, Content } = Layout;

const StoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = product => {
    const existing = cartItems.find(
      item => item.id === product.id
    );

    if (existing) {
      setCartItems(
        cartItems.map(item =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          qty: 1,
        },
      ]);
    }

    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCartItems(
      cartItems
        .map(item => {
          if (item.id === id) {
            return {
              ...item,
              qty: Math.max(0, item.qty + delta),
            };
          }

          return item;
        })
        .filter(item => item.qty > 0)
    );
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <Layout className="min-h-screen bg-[#f5f7f9]">
      {/* Unified Solid Green Header */}
      <header 
        className="bg-[#008061] px-6 sm:px-10 flex items-center justify-between shadow-md sticky top-0 z-50 py-5"
      >
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow overflow-hidden p-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/7-eleven_logo.svg" alt="7-Eleven Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white m-0 tracking-tight" style={{ margin: 0, lineHeight: 1 }}>
            7-Eleven
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-8 text-white font-semibold text-lg">
          <div className="flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors" onClick={() => navigate('/')}>
            <Store className="w-5 h-5" />
            <span>Order Store</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors" onClick={() => navigate('/admin')}>
            <Settings className="w-5 h-5" />
            <span>Admin Portal</span>
          </div>
          
          <div className="w-[1px] h-6 bg-white/30 mx-2"></div>

          <div className="flex items-center gap-6">
            <Badge count={cartItems.length} showZero={false}>
              <ShoppingCart className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => setCartOpen(true)} />
            </Badge>
            <User className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => navigate('/login')} />
          </div>
        </div>

        {/* Mobile Nav Icons */}
        <div className="flex md:hidden items-center gap-6">
          <Badge count={cartItems.length} showZero={false}>
            <ShoppingCart className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => setCartOpen(true)} />
          </Badge>
          <User className="w-6 h-6 text-white cursor-pointer hover:text-white/80 transition-colors" onClick={() => navigate('/login')} />
        </div>
      </header>

      <Content className="relative z-10 py-8 px-4 sm:px-8 max-w-[1500px] w-full mx-auto">
        <Outlet context={{ cartItems, addToCart, cartOpen, setCartOpen }} />
      </Content>

      {/* GLOBAL CART DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-3 text-3xl font-black text-[#008061]">
            <ShoppingCart className="w-8 h-8" />
            Giỏ hàng của bạn
          </div>
        }
        placement="right"
        width={480}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        closeIcon={<div className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><Plus className="w-5 h-5 rotate-45 text-gray-500" /></div>}
        footer={
          cartItems.length > 0 && (
            <div className="pt-4 pb-6 px-4">
              <div className="flex justify-between mb-6 text-2xl font-black">
                <span className="text-gray-800">Tổng cộng:</span>
                <span className="text-[#008061]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full h-16 rounded-[24px] bg-[#008061] hover:!bg-[#00a37c] border-none text-xl font-bold shadow-xl shadow-[#008061]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                icon={<CreditCard className="w-6 h-6 mr-2" />}
              >
                Thanh toán ngay
              </Button>
            </div>
          )
        }
      >
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-16 h-16 opacity-30" />
            </div>
            <p className="text-2xl font-bold text-gray-500 mb-2">
              Giỏ hàng đang trống
            </p>
            <p className="text-center text-gray-400">
              Hãy thêm một vài món đồ ngon miệng vào giỏ nhé!
            </p>
            <Button 
              type="primary" 
              className="mt-8 h-12 px-8 rounded-full bg-[#008061] hover:!bg-[#00a37c] border-none font-bold shadow-lg shadow-[#008061]/20 hover:-translate-y-1 transition-transform" 
              onClick={() => setCartOpen(false)}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-2">

            {cartItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-5 bg-white border border-gray-100 rounded-[28px] p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative w-28 h-28 rounded-[20px] overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 py-1">
                  <h4 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-2">
                    {item.name}
                  </h4>

                  <p className="text-[#008061] font-black text-xl mb-3">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 bg-gray-50 rounded-full w-max p-1.5 border border-gray-100">
                    <Button
                      shape="circle"
                      type="text"
                      className="hover:bg-white flex items-center justify-center shadow-sm"
                      icon={<Minus className="w-4 h-4 text-gray-600" />}
                      onClick={() => updateQty(item.id, -1)}
                    />

                    <span className="font-bold text-lg w-6 text-center text-gray-800">
                      {item.qty}
                    </span>

                    <Button
                      shape="circle"
                      type="text"
                      className="hover:bg-white flex items-center justify-center shadow-sm"
                      icon={<Plus className="w-4 h-4 text-gray-600" />}
                      onClick={() => updateQty(item.id, 1)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </Layout>
  );
};

export default StoreLayout;
