import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] relative z-10">
      <div className="glass-panel p-12 rounded-[24px] max-w-lg w-full text-center border border-white/20" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <CheckCircle className="w-24 h-24 text-[#00a37c] mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-white mb-4">Order Successful!</h1>
        <p className="text-white/80 mb-8 text-lg">
          Thank you for your purchase. Your order has been placed and is being processed.
        </p>
        <div className="bg-white/10 p-4 rounded-xl mb-8 text-left border border-white/10">
          <p className="text-sm text-white/60 mb-1">Order Number:</p>
          <p className="font-bold text-[#ff6b00] text-xl">#ORD-711-2026-X8F9</p>
        </div>
        <Button 
          type="primary" 
          size="large" 
          className="w-full bg-gradient-to-r from-[#008061] to-[#00a37c] border-none shadow-lg h-12 text-lg font-bold"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
