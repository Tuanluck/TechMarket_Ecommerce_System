import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  Ticket,
  Percent,
  LogOut,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <LayoutDashboard size={18} />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingBag size={18} />,
      label: <Link to="/admin/products">Sản phẩm</Link>,
    },
    {
      key: '/admin/orders',
      icon: <Receipt size={18} />,
      label: <Link to="/admin/orders">Đơn hàng</Link>,
    },
    {
      key: '/admin/users',
      icon: <Users size={18} />,
      label: <Link to="/admin/users">Người dùng</Link>,
    },
    {
      key: '/admin/vouchers',
      icon: <Ticket size={18} />,
      label: <Link to="/admin/vouchers">Vouchers</Link>,
    },
    {
      key: '/admin/flash-sales',
      icon: <Percent size={18} />,
      label: <Link to="/admin/flash-sales">Flash Sale</Link>,
    },
  ];

  const userDropdownItems = [
    {
      key: 'home',
      label: <Link to="/">Về trang chủ</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span className="flex items-center text-red-600 gap-2" onClick={handleLogout}>
          <LogOut size={16} /> Đăng xuất
        </span>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="shadow-sm border-r border-sky-200/80"
        style={{
          backgroundColor: '#f0f9ff',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sky-200/80">
          {!collapsed && (
            <span className="text-base font-extrabold text-blue-900 flex items-center gap-1.5">
              <span className="text-blue-600">TechMarket</span>
              <span className="text-[10px] bg-sky-100 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-sky-200">PRO</span>
            </span>
          )}
          <Button
            type="text"
            icon={collapsed ? <ChevronRight size={18} className="text-sky-600" /> : <ChevronLeft size={18} className="text-sky-600" />}
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center text-sky-600 hover:bg-sky-200/50 w-8 h-8 rounded-lg ml-auto border-none cursor-pointer"
          />
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ backgroundColor: 'transparent', border: 'none', marginTop: '1rem' }}
          className="admin-sidebar-menu"
        />
      </Sider>

      <Layout className="flex flex-col bg-slate-50">
        <Header 
          className="h-16 border-b border-sky-200/80 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm"
          style={{ backgroundColor: '#f0f9ff' }}
        >
          <div className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            Xin chào, <span className="font-bold text-blue-950">{user?.fullName || 'admin'}</span>
            <span className="text-[10px] uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
              ADMIN
            </span>
            <Avatar size={24} className="bg-sky-100 text-blue-600" icon={<UserIcon size={12} />} src={user?.avatar} />
          </div>

          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-sky-200/40 rounded-lg transition-all duration-200 border border-transparent hover:border-sky-200">
              <span className="flex items-center gap-1 text-sm font-bold text-blue-900">
                <span className="text-yellow-500 text-xs">👑</span> Admin
              </span>
              <Avatar style={{ backgroundColor: '#0284c7' }} icon={<UserIcon size={16} />} src={user?.avatar} />
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 md:p-8 flex-1 overflow-auto max-w-full">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
