import React, { useEffect, useState, useMemo } from 'react';
import { Table, Input, Select, Spin, Avatar } from 'antd';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  CreditCard,
  Package
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    document.title = 'Dashboard - TechMarket Admin';
    axiosInstance
      .get('/admin/stats')
      .then((res) => {
        setStats(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statuses = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ duyệt',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-250',
          icon: <Clock size={12} className="text-amber-500" />,
        };
      case 'processing':
        return {
          label: 'Đang xử lý',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <RefreshCw size={12} className="text-blue-500" />,
        };
      case 'shipped':
        return {
          label: 'Đang giao',
          bg: 'bg-cyan-50',
          text: 'text-cyan-700',
          border: 'border-cyan-200',
          icon: <Truck size={12} className="text-cyan-500" />,
        };
      case 'delivered':
        return {
          label: 'Đã giao',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-250',
          icon: <CheckCircle2 size={12} className="text-emerald-500" />,
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <XCircle size={12} className="text-red-500" />,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <AlertCircle size={12} className="text-slate-500" />,
        };
    }
  };

  const filteredOrders = useMemo(() => {
    if (!stats || !stats.recentOrders) return [];
    return stats.recentOrders.filter((order) => {
      const matchSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.userId?.fullName && order.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = !statusFilter || order.orderStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stats, searchTerm, statusFilter]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  // Calculate Doughnut segments
  const statusValues = stats.ordersByStatus || {};
  const segments = [
    { key: 'pending', count: statusValues.pending || 0, color: '#f59e0b', label: 'Pending' },
    { key: 'shipped', count: statusValues.shipped || 0, color: '#06b6d4', label: 'Shipped' },
    { key: 'delivered', count: statusValues.delivered || 0, color: '#10b981', label: 'Delivered' },
    { key: 'processing', count: statusValues.processing || 0, color: '#3b82f6', label: 'Processing' },
    { key: 'cancelled', count: statusValues.cancelled || 0, color: '#ef4444', label: 'Cancelled' },
  ];
  
  const activeSegments = segments.filter((s) => s.count > 0);
  const sumCounts = activeSegments.reduce((sum, s) => sum + s.count, 0) || 1;
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  let accumulatedCircumference = 0;

  const chartSegments = activeSegments.map((seg) => {
    const pct = seg.count / sumCounts;
    const strokeLength = pct * circumference;
    const strokeOffset = -accumulatedCircumference;
    accumulatedCircumference += strokeLength;
    return {
      ...seg,
      strokeDasharray: `${strokeLength} ${circumference}`,
      strokeOffset,
    };
  });

  const recentOrdersColumns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className="font-mono text-xs font-semibold text-slate-700">{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['userId', 'fullName'],
      key: 'customerName',
      render: (name) => <span className="text-slate-650 font-semibold text-xs">{name || 'N/A'}</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (val) => (
        <span className="font-bold text-slate-800 text-xs">
          {val?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        if (status === 'paid') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              Đã thanh toán
            </span>
          );
        }
        if (status === 'refunded') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-100">
              Đã hoàn tiền
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100">
            Chưa thanh toán
          </span>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        const d = new Date(date);
        return (
          <span className="text-slate-450 font-semibold text-[10px]">
            {d.toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm">Tổng quan tình hình kinh doanh của hệ thống</p>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white p-5 rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl flex items-center justify-center">
                <DollarSign size={16} />
              </div>
              <span className="text-slate-500 font-bold text-sm ml-3">Doanh thu</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={10} /> 12%
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-2">
            {stats.totalRevenue?.toLocaleString('vi-VN')} đ
          </div>
          
          <svg viewBox="0 0 115 30" className="w-full h-8 absolute bottom-0 left-0 right-0 overflow-visible text-emerald-500 fill-none">
            <path d="M 0 25 Q 35 25, 65 22 T 115 8 L 115 30 L 0 30 Z" fill="url(#green-grad)" stroke="none" opacity="0.15" />
            <path d="M 0 25 Q 35 25, 65 22 T 115 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Đơn hàng Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/20 to-white p-5 rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 text-orange-600 p-2 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <span className="text-slate-500 font-bold text-sm ml-3">Đơn hàng</span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            {stats.totalOrders}
          </div>

          <svg viewBox="0 0 115 30" className="w-full h-8 absolute bottom-0 left-0 right-0 overflow-visible text-orange-500 fill-none">
            <path d="M 0 25 C 25 18, 35 28, 60 20 C 80 12, 95 24, 115 16 L 115 30 L 0 30 Z" fill="url(#orange-grad)" stroke="none" opacity="0.15" />
            <path d="M 0 25 C 25 18, 35 28, 60 20 C 80 12, 95 24, 115 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Sản phẩm Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/20 to-white p-5 rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-xl flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <span className="text-slate-500 font-bold text-sm ml-3">Sản phẩm</span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            {stats.totalProducts}
          </div>

          <svg viewBox="0 0 115 30" className="w-full h-8 absolute bottom-0 left-0 right-0 overflow-visible text-purple-500 fill-none">
            <path d="M 0 25 C 20 20, 35 28, 55 15 C 75 8, 95 25, 115 18 L 115 30 L 0 30 Z" fill="url(#purple-grad)" stroke="none" opacity="0.15" />
            <path d="M 0 25 C 20 20, 35 28, 55 15 C 75 8, 95 25, 115 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Khách hàng Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/20 to-white p-5 rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-xl flex items-center justify-center">
                <UsersIcon size={16} />
              </div>
              <span className="text-slate-500 font-bold text-sm ml-3">Khách hàng</span>
            </div>
            <span className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDownRight size={10} /> 5%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            {stats.totalUsers}
          </div>

          <svg viewBox="0 0 115 30" className="w-full h-8 absolute bottom-0 left-0 right-0 overflow-visible text-blue-500 fill-none">
            <path d="M 0 28 Q 50 12, 90 20 T 115 26 L 115 30 L 0 30 Z" fill="url(#blue-grad)" stroke="none" opacity="0.15" />
            <path d="M 0 28 Q 50 12, 90 20 T 115 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Two Column Layout: Doughnut and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Doughnut */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full min-h-[300px]">
          <h2 className="text-base font-bold text-slate-850 mb-4">Trạng thái đơn hàng</h2>
          
          <div className="flex flex-row items-center justify-around flex-1">
            {/* SVG Doughnut */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                {activeSegments.length === 0 ? (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                ) : (
                  chartSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeOffset}
                      className="transition-all duration-500 ease-in-out"
                    />
                  ))
                )}
              </svg>
              {/* Center text */}
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tổng: {stats.totalOrders}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Đơn hàng</span>
              </div>
            </div>

            {/* Vertical Legend List */}
            <div className="flex flex-col gap-3 justify-center pl-4 border-l border-slate-50">
              {segments.map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</div>
                    <div className="text-sm font-black text-slate-700 mt-0.5">{item.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-slate-850">Đơn hàng gần đây</h2>
            
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search"
                prefix={<Search size={14} className="text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 h-8 rounded-lg text-xs border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:ring-0"
                allowClear
              />
              
              <Select
                placeholder="Date Range"
                defaultValue="all"
                style={{ width: 110 }}
                className="h-8 text-xs [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-lg"
              >
                <Select.Option value="all">All Date</Select.Option>
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="7days">7 ngày qua</Select.Option>
              </Select>

              <Select
                placeholder="Status"
                value={statusFilter || undefined}
                onChange={(val) => setStatusFilter(val || '')}
                style={{ width: 100 }}
                allowClear
                className="h-8 text-xs [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-lg"
              >
                {statuses.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <Table
            columns={recentOrdersColumns}
            dataSource={filteredOrders}
            rowKey="_id"
            pagination={false}
            className="border border-slate-50 rounded-xl overflow-hidden [&_.ant-table]:text-slate-750"
            rowClassName={(record) => {
              if (record.orderStatus === 'cancelled') {
                return 'bg-red-50/40 hover:bg-red-100/40 transition-colors';
              }
              if (record.orderStatus === 'delivered') {
                return 'bg-emerald-50/20 hover:bg-emerald-100/20 transition-colors';
              }
              return 'hover:bg-slate-50 transition-colors';
            }}
            summary={(pageData) => {
              let totalAmount = 0;
              pageData.forEach(({ finalAmount }) => {
                totalAmount += finalAmount || 0;
              });

              return (
                <Table.Summary.Row className="bg-slate-50/50 font-bold border-t border-slate-100">
                  <Table.Summary.Cell index={0} className="font-mono text-xs text-slate-750">Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-slate-650 text-xs">
                    {pageData.length > 0 ? pageData[0].userId?.fullName || 'N/A' : ''}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} className="text-slate-800 text-xs">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Đã giao
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-550 border border-red-100">
                      Chưa thanh toán
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} className="text-slate-450 text-[10px]">
                    {pageData.length > 0 ? new Date(pageData[0].createdAt).toLocaleDateString('vi-VN') : ''}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

