import React, { useState } from 'react';
import { Input, Button, Card, Drawer, Badge } from 'antd';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

const mockProducts = [
  {
    id: 1,
    name: 'Slurpee Cherry',
    price: 2.99,
    category: 'Đồ uống',
    img: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Big Bite Hot Dog',
    price: 3.49,
    category: 'Đồ ăn',
    img: 'https://images.unsplash.com/photo-1612392062798-2b4b7b49dc35?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    name: '7-Select Chips',
    price: 1.99,
    category: 'Snack',
    img: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Cà phê đá',
    price: 2.49,
    category: 'Đồ uống',
    img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1200&auto=format&fit=crop',
  },
];

const categories = [
  'Tất cả',
  'Đồ uống',
  'Đồ ăn',
  'Snack',
  'Bánh ngọt',
];

const StoreHome = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const filteredProducts =
    activeCategory === 'Tất cả'
      ? mockProducts
      : mockProducts.filter(
          product => product.category === activeCategory
        );

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
    <div className="min-h-screen bg-[#f5f7f9]">

     
      <div className="max-w-[1500px] mx-auto px-8 py-8">

        {/* HERO */}
        <div className="bg-gradient-to-r from-[#006c52] to-[#008061] rounded-[30px] p-10 text-white relative overflow-hidden mb-10 shadow-xl">

          <div className="absolute right-0 top-0 w-[500px] h-full opacity-10">
            <div className="w-full h-full bg-white blur-3xl"></div>
          </div>

          <div className="flex items-center justify-between relative z-10">

            <div>
              <h2 className="text-6xl font-black mb-3 leading-tight">
                Chào mừng đến với{' '}
                <span className="text-[#7dffcf]">
                  7-Eleven
                </span>
              </h2>

              <p className="text-2xl text-white/90 mb-8">
                Hôm nay bạn muốn ăn gì?
              </p>

              <Input
                size="large"
                placeholder="Tìm kiếm sản phẩm..."
                prefix={
                  <Search className="w-5 h-5 text-gray-400" />
                }
                className="h-16 max-w-[700px] rounded-2xl text-lg"
              />
            </div>

            <div className="hidden lg:flex bg-white rounded-3xl p-8 text-[#008061] min-w-[280px] shadow-xl flex-col">
              <div className="flex items-center gap-3 text-2xl font-bold mb-4">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                Cửa hàng đang mở
              </div>

              <div className="flex items-center gap-3 text-xl">
                <Clock className="w-5 h-5" />

                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="flex gap-4 mb-10 overflow-x-auto">

          {categories.map(cat => {
            const active = activeCategory === cat;

            return (
              <Button
                key={cat}
                shape="round"
                onClick={() => setActiveCategory(cat)}
                className={`h-14 px-8 text-lg font-bold transition-all border-2 ${
                  active
                    ? 'bg-[#008061] text-white border-[#008061]'
                    : 'bg-white text-[#008061] border-[#008061]/20 hover:border-[#008061]'
                }`}
              >
                {cat}
              </Button>
            );
          })}
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {filteredProducts.map(product => (
            <Card
              key={product.id}
              className="rounded-[28px] overflow-hidden border-0 shadow-lg hover:-translate-y-2 transition-all duration-300"
              bodyStyle={{
                padding: 20,
              }}
              cover={
                <div
                  className="h-[260px] overflow-hidden relative cursor-pointer group"
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 duration-500"
                  />

                  <div className="absolute top-4 right-4 bg-[#008061] text-white px-4 py-2 rounded-2xl text-lg font-bold shadow-lg">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              }
            >
              <Meta
                title={
                  <h3 className="text-3xl font-black text-[#111827]">
                    {product.name}
                  </h3>
                }
                description={
                  <div className="mt-4">
                    <span className="bg-[#008061]/10 text-[#008061] px-3 py-1 rounded-xl text-sm font-bold uppercase">
                      {product.category}
                    </span>
                  </div>
                }
              />

              <Button
                type="primary"
                className="mt-8 h-14 rounded-2xl bg-[#008061] hover:!bg-[#00a37c] border-none text-lg font-bold w-full shadow-lg"
                icon={
                  <ShoppingCart className="w-5 h-5" />
                }
                onClick={() => addToCart(product)}
              >
                Thêm vào giỏ
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* CART */}
      <Drawer
        title={
          <div className="flex items-center gap-3 text-2xl font-bold text-[#008061]">
            <ShoppingCart />
            Giỏ hàng
          </div>
        }
        placement="right"
        width={420}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        footer={
          cartItems.length > 0 && (
            <div>
              <div className="flex justify-between mb-5 text-xl font-bold">
                <span>Tổng cộng:</span>

                <span className="text-[#008061]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full h-14 rounded-2xl bg-[#008061] hover:!bg-[#00a37c] border-none text-lg font-bold"
                icon={<CreditCard />}
              >
                Thanh toán
              </Button>
            </div>
          )
        }
      >
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <ShoppingCart className="w-20 h-20 opacity-20 mb-4" />

            <p className="text-xl font-semibold">
              Giỏ hàng đang trống
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {cartItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />

                <div className="flex-1">
                  <h4 className="text-lg font-bold">
                    {item.name}
                  </h4>

                  <p className="text-[#008061] font-bold mt-2">
                    $
                    {(item.price * item.qty).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    shape="circle"
                    icon={<Minus className="w-4 h-4" />}
                    onClick={() =>
                      updateQty(item.id, -1)
                    }
                  />

                  <span className="font-bold text-lg">
                    {item.qty}
                  </span>

                  <Button
                    shape="circle"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() =>
                      updateQty(item.id, 1)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StoreHome;