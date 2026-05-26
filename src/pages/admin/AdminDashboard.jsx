import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import DashBoardService from '../../service/dashboard/dashBoardService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 });
  const [salesData, setSalesData] = useState([]);
  const [viewType, setViewType] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [viewType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resSales, resUsers] = await Promise.all([
        DashBoardService.getDashboardStats(),
        viewType === 'weekly' ? DashBoardService.getWeeklySales() : DashBoardService.getMonthlySales(),
        DashBoardService.getTotalUsers()
      ]);

      const statsData = resStats?.data || {};
      const salesRes = resSales?.data || [];
      const userData = resUsers?.data || {};

      setStats({
        revenue: statsData.totalRevenue || 0,
        totalOrders: statsData.totalOrders || 0,
        totalUsers: userData.totalUsers || 0,
        totalProducts: statsData.totalProducts || 0
      });

      if (viewType === 'monthly') {
        const allMonths = [
          { label: "Jan", num: 1 }, { label: "Feb", num: 2 }, { label: "Mar", num: 3 },
          { label: "Apr", num: 4 }, { label: "May", num: 5 }, { label: "Jun", num: 6 },
          { label: "Jul", num: 7 }, { label: "Aug", num: 8 }, { label: "Sep", num: 9 },
          { label: "Oct", num: 10 }, { label: "Nov", num: 11 }, { label: "Dec", num: 12 }
        ];
        const monthlyData = allMonths.map(monthObj => {
          const found = salesRes.find(item => {
            const m = item.month || item._id; // _id is sometimes used in aggregation
            if (typeof m === 'number') return m === monthObj.num;
            if (typeof m === 'string') {
              return m.substring(0, 3).toLowerCase() === monthObj.label.toLowerCase() ||
                m === monthObj.num.toString();
            }
            return false;
          });
          return {
            label: monthObj.label,
            amount: found ? (found.revenue || found.total || 0) : 0
          };
        });
        setSalesData(monthlyData);
      } else {
        const allDays = [
          { label: "Mon", num: 2 }, { label: "Tue", num: 3 }, { label: "Wed", num: 4 },
          { label: "Thu", num: 5 }, { label: "Fri", num: 6 }, { label: "Sat", num: 7 },
          { label: "Sun", num: 1 } // MongoDB $dayOfWeek: 1 is Sunday
        ];
        const weeklyData = allDays.map(dayObj => {
          const found = salesRes.find(item => {
            const d = item.dayOfWeek || item.day || item._id; // handling various backend formats
            if (typeof d === 'number') return d === dayObj.num;
            if (typeof d === 'string') {
              return d.substring(0, 3).toLowerCase() === dayObj.label.toLowerCase() ||
                d === dayObj.num.toString();
            }
            return false;
          });
          return {
            label: dayObj.label,
            amount: found ? (found.revenue || found.total || 0) : 0
          };
        });
        setSalesData(weeklyData);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = Math.max(...salesData.map(s => s.amount), 1);
  const chartHeight = 200;
  const chartWidth = 800;
  const barWidth = salesData.length === 12 ? 35 : 50;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng doanh thu" value={`${stats.revenue.toLocaleString()} ₫`} icon={DollarSign} color="text-red-600" />
        <StatCard title="Tổng đơn hàng" value={`${stats.totalOrders}`} icon={ShoppingBag} color="text-orange-500" />
        <StatCard title="Người dùng" value={`${stats.totalUsers}`} icon={Users} color="text-blue-600" />
        <StatCard title="Sản phẩm" value={`${stats.totalProducts}`} icon={Package} color="text-green-700" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-gray-800">Phân tích doanh thu</h3>
          <select className="bg-gray-100 rounded-lg p-2 text-sm cursor-pointer" value={viewType} onChange={(e) => setViewType(e.target.value)}>
            <option value="weekly">Theo Tuần</option>
            <option value="monthly">Theo Tháng</option>
          </select>
        </div>

        <div className="w-full h-[250px] relative">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Đang tải...</div>
          ) : (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-full overflow-visible">
              {salesData.map((item, index) => {
                const gap = (chartWidth - (salesData.length * barWidth)) / (salesData.length + 1);
                const x = gap + index * (barWidth + gap);
                // Cột giá trị 0 vẫn hiện 4px, cột có dữ liệu dùng calc để nổi bật hơn
                const barHeight = item.amount === 0 ? 4 : Math.max(20, (item.amount / maxAmount) * 160);
                const y = chartHeight - barHeight;

                return (
                  <g key={index} className="group cursor-pointer">
                    <rect x={x - 20} y={y - 45} width="90" height="30" rx="4" className="fill-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <text x={x + 25} y={y - 25} textAnchor="middle" className="fill-white text-[12px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      {item.amount.toLocaleString()}đ
                    </text>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} className="fill-[#008061] transition-all duration-700 group-hover:fill-[#00664d]" />
                    <text x={x + barWidth / 2} y={chartHeight + 25} textAnchor="middle" className="fill-gray-500 text-[10px] font-bold">
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div className="text-gray-500 text-sm mb-2">{title}</div>
    <div className="flex items-center text-gray-900 font-extrabold text-[24px]">
      <Icon className={`w-7 h-7 ${color} mr-3`} />
      <span className={color}>{value}</span>
    </div>
  </div>
);

export default AdminDashboard;