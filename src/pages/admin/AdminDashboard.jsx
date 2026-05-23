import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { DollarSign, ShoppingBag, Users, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for the weekly sales chart
  const weeklySales = [
    { day: 'Mon', amount: 1200, height: '40%' },
    { day: 'Tue', amount: 1900, height: '65%' },
    { day: 'Wed', amount: 1500, height: '50%' },
    { day: 'Thu', amount: 2400, height: '80%' },
    { day: 'Fri', amount: 2900, height: '95%' },
    { day: 'Sat', amount: 2100, height: '70%' },
    { day: 'Sun', amount: 1700, height: '55%' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white m-0 tracking-wide">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back to your 7-Eleven Admin Portal</p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Total Revenue Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="glass-card border-none rounded-2xl relative overflow-hidden" 
            bodyStyle={{ padding: '24px' }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#008061]/10 rounded-full blur-2xl"></div>
            <Statistic 
              title={<span className="text-gray-400 font-medium text-sm">Total Revenue</span>}
              value={12450.00} 
              precision={2} 
              prefix={<DollarSign className="w-5 h-5 text-emerald-400 mr-1" />} 
              valueStyle={{ color: '#ffffff', fontWeight: '800', fontSize: '28px' }}
            />
            <div className="mt-4 flex items-center text-sm text-emerald-400 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" /> 
              <span>+15.3% from last month</span>
            </div>
          </Card>
        </Col>
        
        {/* Total Orders Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="glass-card border-none rounded-2xl relative overflow-hidden" 
            bodyStyle={{ padding: '24px' }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6b00]/10 rounded-full blur-2xl"></div>
            <Statistic 
              title={<span className="text-gray-400 font-medium text-sm">Total Orders</span>}
              value={842} 
              prefix={<ShoppingBag className="w-5 h-5 text-orange mr-1" />} 
              valueStyle={{ color: '#ffffff', fontWeight: '800', fontSize: '28px' }}
            />
            <div className="mt-4 flex items-center text-sm text-emerald-400 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" /> 
              <span>+5.2% from last week</span>
            </div>
          </Card>
        </Col>

        {/* Active Users Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="glass-card border-none rounded-2xl relative overflow-hidden" 
            bodyStyle={{ padding: '24px' }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <Statistic 
              title={<span className="text-gray-400 font-medium text-sm">Active Users</span>}
              value={3210} 
              prefix={<Users className="w-5 h-5 text-blue-400 mr-1" />} 
              valueStyle={{ color: '#ffffff', fontWeight: '800', fontSize: '28px' }}
            />
            <div className="mt-4 flex items-center text-sm text-gray-400 font-medium">
              <span>Steady growth</span>
            </div>
          </Card>
        </Col>

        {/* System Status Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="border-none rounded-2xl bg-gradient-to-br from-[#008061] to-[#004d3a] relative overflow-hidden shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-transform duration-300" 
            bodyStyle={{ padding: '24px' }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Activity className="w-32 h-32 text-white" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">System Status</h3>
            <div className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
              All Systems Good
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white h-2 rounded-full shadow-inner" style={{ width: '100%' }}></div>
            </div>
            <div className="text-xs text-white/70">Refreshed 2 mins ago</div>
          </Card>
        </Col>
      </Row>

      {/* Interactive Chart Section */}
      <div className="mt-8 glass-card rounded-2xl p-6 sm:p-8 border border-white/10 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-white m-0">Weekly Sales Analysis</h3>
            <p className="text-sm text-gray-400 m-0">Live revenue tracking in USD</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#008061]"></span> Drinks
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#ff6b00]"></span> Food & Snacks
            </span>
          </div>
        </div>

        {/* Visual HTML Chart Mockup with Hover Effects */}
        <div className="h-[280px] flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-white/10 px-2 sm:px-6 relative">
          {/* Grid lines background */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="w-full border-t border-white/5 h-0"></div>
            <div className="w-full border-t border-white/5 h-0"></div>
            <div className="w-full border-t border-white/5 h-0"></div>
            <div className="w-full border-t border-white/5 h-0"></div>
          </div>

          {weeklySales.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative z-1">
              {/* Tooltip on Hover */}
              <div className="absolute -top-12 bg-[#1e293b] border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none z-10 whitespace-nowrap">
                ${item.amount.toLocaleString()}
              </div>

              {/* Animated Bar */}
              <div 
                className="w-8 sm:w-12 rounded-t-lg bg-gradient-to-t from-[#008061]/80 to-[#ff6b00]/80 group-hover:from-[#008061] group-hover:to-[#ff6b00] transition-all duration-500 cursor-pointer shadow-md shadow-black/20 group-hover:shadow-[#008061]/20 group-hover:scale-x-105"
                style={{ height: item.height }}
              ></div>

              {/* Day Label */}
              <span className="text-xs text-gray-400 mt-3 font-semibold group-hover:text-white transition-colors">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
