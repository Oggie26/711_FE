import React from 'react';
import { Button, Divider } from 'antd';
import { ShoppingCart, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useOutletContext();

  // Mock product
  const product = {
    id: Number(id) || 1,
    name: 'Slurpee Cherry Large',
    price: 2.99,
    category: 'Drinks',
    stock: 50,
    desc: 'The original frozen beverage. Refreshingly sweet, icy, and packed with classic cherry flavor. Perfect for a hot day!',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop'
  };

  return (
    <div 
      className="glass-panel rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto text-white relative z-10 border border-white/10 shadow-2xl" 
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(20px)' }}
    >
      <Button 
        type="text" 
        icon={<ArrowLeft className="w-4 h-4 text-white group-hover:text-orange" />} 
        onClick={() => navigate(-1)} 
        className="mb-8 text-white hover:text-orange font-semibold flex items-center gap-1 hover:bg-white/5 border border-transparent hover:border-white/10 px-4 h-9 rounded-lg transition-all group"
      >
        Back to Store
      </Button>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-1/2">
          <div className="rounded-2xl overflow-hidden bg-white/5 h-[360px] border border-white/10 shadow-md">
            <img src={product.img} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span 
                className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 tracking-wider"
              >
                {product.category}
              </span>
              <div className="flex gap-2">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<Heart className="w-5 h-5 text-white/70 hover:text-rose-400 hover:scale-105" />} 
                  className="hover:bg-white/10"
                />
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<Share2 className="w-5 h-5 text-white/70 hover:text-emerald-400 hover:scale-105" />} 
                  className="hover:bg-white/10"
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-wide leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-extrabold text-orange mb-6 drop-shadow-md">
              ${product.price.toFixed(2)}
            </p>

            <Divider className="my-0 mb-6 border-white/10" />

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {product.desc}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-400 font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-[#34d399] font-bold">In Stock ({product.stock} left)</span>
              ) : (
                <span className="text-red-400 font-bold">Out of Stock</span>
              )}
            </div>

            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingCart className="w-5 h-5 mr-1" />} 
              className="w-full bg-gradient-to-r from-orange to-[#ff8c00] border-none h-12 text-lg font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.01] hover:shadow-orange-500/30 transition-all rounded-xl flex items-center justify-center"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
