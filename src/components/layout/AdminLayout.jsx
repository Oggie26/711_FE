import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu as MenuIcon, User } from 'lucide-react';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" />, label: 'Dashboard' },
    { key: '/admin/products', icon: <Package className="w-5 h-5 text-orange" />, label: 'Products' },
    { key: '/admin/orders', icon: <ShoppingBag className="w-5 h-5 text-cyan-400" />, label: 'Orders' },
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <User className="w-4 h-4 text-gray-300" />, label: <span className="text-gray-200">Profile</span> },
      { type: 'divider' },
      { key: 'logout', icon: <LogOut className="w-4 h-4 text-red-400" />, label: <span className="text-red-400">Logout</span>, onClick: () => navigate('/login') },
    ]
  };

  return (
    <div className="bg-admin-mesh min-h-screen">
      <Layout className="min-h-screen" style={{ background: 'transparent' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          width={260} 
          style={{ background: 'rgba(10, 15, 30, 0.45)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#008061] to-[#ff6b00] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">7E</span>
              </div>
              {!collapsed && (
                <span className="text-white font-bold text-lg tracking-wide drop-shadow-sm">
                  7-Eleven <span className="text-emerald-400">Admin</span>
                </span>
              )}
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="mt-6 border-none bg-transparent"
          />
        </Sider>
        
        <Layout style={{ background: 'transparent' }}>
          <Header className="flex items-center justify-between px-6 h-16" style={{ background: 'rgba(10, 15, 30, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Button
              type="text"
              icon={<MenuIcon className="w-5 h-5 text-white" />}
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/15 border-none transition-all rounded-lg"
            />
            
            <Dropdown menu={userMenu} placement="bottomRight" dropdownClassName="ant-select-dropdown">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-white/10">
                <Avatar className="bg-gradient-to-tr from-[#008061] to-[#00a37c] text-white font-bold">A</Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-white m-0 leading-tight">Admin User</p>
                  <p className="text-xs text-gray-400 m-0 leading-tight">admin@7eleven.com</p>
                </div>
              </div>
            </Dropdown>
          </Header>
          
          <Content className="m-6 sm:m-8">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 min-h-[calc(100vh-130px)] shadow-xl relative overflow-hidden">
              {/* Background ambient highlights inside content */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default AdminLayout;
