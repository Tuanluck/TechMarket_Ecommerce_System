import React, { useEffect, useState, useMemo } from 'react';
import { Table, Input, Select, Drawer, message, Spin, Divider, Avatar } from 'antd';
import {
  Eye,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Truck,
  Calendar,
  CreditCard,
  Package,
  User,
  MapPin,
  Phone
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 15,
    q: '',
    status: '',
    paymentStatus: '',
  });

  const statuses = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const paymentStatuses = [
    { value: 'unpaid', label: 'Chưa thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'refunded', label: 'Đã hoàn tiền' },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: <Clock size={13} className="text-amber-500" />,
        };
      case 'processing':
        return {
          bg: 'bg-blue-50 hover:bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <RefreshCw size={13} className="text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />,
        };
      case 'shipped':
        return {
          bg: 'bg-cyan-50 hover:bg-cyan-100',
          text: 'text-cyan-700',
          border: 'border-cyan-200',
          icon: <Truck size={13} className="text-cyan-500" />,
        };
      case 'delivered':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: <CheckCircle2 size={13} className="text-emerald-500" />,
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 hover:bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <XCircle size={13} className="text-red-500" />,
        };
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: <AlertCircle size={13} className="text-slate-500" />,
        };
    }
  };

  const fetchOrders = () => {
    setLoading(true);
    const params = {};
    if (queryParams.page) params.page = queryParams.page;
    if (queryParams.limit) params.limit = queryParams.limit;
    if (queryParams.q) params.q = queryParams.q;
    if (queryParams.status) params.status = queryParams.status;
    if (queryParams.paymentStatus) params.paymentStatus = queryParams.paymentStatus;

    axiosInstance
      .get('/admin/orders', { params })
      .then((res) => {
        setOrders(res.data.data.orders);
        setTotal(res.data.data.total);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách đơn hàng');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Quản lý đơn hàng - TechMarket Admin';
    fetchOrders();
  }, [queryParams]);

  const handleViewDetails = (record) => {
    setSelectedOrder(record);
    setDrawerVisible(true);
    setDrawerLoading(true);
    axiosInstance
      .get(`/orders/${record._id}`)
      .then((res) => {
        setOrderItems(res.data.data.items);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải chi tiết đơn hàng');
      })
      .finally(() => {
        setDrawerLoading(false);
      });
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    axiosInstance
      .patch(`/orders/${orderId}/status`, { status: newStatus })
      .then(() => {
        message.success('Cập nhật trạng thái thành công');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
      });
  };

  // Client-side sorting based on createdAt and sortOrder state
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [orders, sortOrder]);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className="font-mono text-sm font-semibold text-slate-700">{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['userId', 'fullName'],
      key: 'customerName',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.userId?.avatar}
            icon={<User size={16} />}
            className="bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
            size={36}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 text-sm truncate leading-tight">{name || 'N/A'}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{record.userId?.email || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['shippingAddress', 'phone'],
      key: 'phone',
      render: (phone) => <span className="text-slate-600 font-medium text-sm">{phone || 'N/A'}</span>,
    },
    {
      title: 'Số tiền thanh toán',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (val) => (
        <span className="font-bold text-slate-900 text-sm">
          {val?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        if (status === 'paid') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Đã thanh toán
            </span>
          );
        }
        if (status === 'refunded') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">
              <RefreshCw size={12} className="text-purple-500" />
              Đã hoàn tiền
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
            <Clock size={12} className="text-red-500" />
            Chưa thanh toán
          </span>
        );
      },
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status, record) => {
        const config = getStatusConfig(status);
        return (
          <Select
            value={status}
            onChange={(val) => handleUpdateStatus(record._id, val)}
            variant="borderless"
            popupClassName="status-dropdown"
            suffixIcon={null}
            className={`status-select-pill font-semibold text-xs rounded-full border ${config.bg} ${config.text} ${config.border} transition-all duration-200`}
            style={{
              height: '28px',
              padding: '0 8px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {statuses.map((s) => {
              const sCfg = getStatusConfig(s.value);
              return (
                <Select.Option key={s.value} value={s.value}>
                  <span className="flex items-center gap-2 py-1">
                    {sCfg.icon}
                    <span className={`font-semibold ${sCfg.text}`}>{s.label}</span>
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr) => {
        const dateObj = new Date(dateStr);
        const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return (
          <div className="flex flex-col text-xs text-slate-600 font-medium">
            <span>{time}</span>
            <span className="text-slate-400 font-normal mt-0.5">{date}</span>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <button
          onClick={() => handleViewDetails(record)}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-all duration-200 shadow-sm shadow-blue-100 hover:shadow-md cursor-pointer border-none"
        >
          <Eye size={13} />
          Xem
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h1>
        <p className="text-slate-500">Xem và cập nhật trạng thái đơn hàng của hệ thống</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Input
            placeholder="Tìm theo Mã đơn hàng..."
            prefix={<Search size={16} className="text-slate-400" />}
            value={queryParams.q}
            onChange={(e) => setQueryParams({ ...queryParams, q: e.target.value, page: 1 })}
            style={{ width: 260 }}
            allowClear
            className="rounded-xl h-10 border-slate-200 hover:border-slate-300 focus:border-blue-500"
          />
          
          <Select
            placeholder={
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar size={15} />
                <span>Ngày đặt</span>
              </span>
            }
            value={sortOrder}
            onChange={(val) => setSortOrder(val || 'desc')}
            style={{ width: 180 }}
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
          >
            <Select.Option value="desc">Ngày đặt: Mới nhất</Select.Option>
            <Select.Option value="asc">Ngày đặt: Cũ nhất</Select.Option>
          </Select>

          <Select
            placeholder={
              <span className="flex items-center gap-2 text-slate-500">
                <CreditCard size={15} />
                <span>Trạng thái toán</span>
              </span>
            }
            value={queryParams.paymentStatus || undefined}
            onChange={(val) => setQueryParams({ ...queryParams, paymentStatus: val || '', page: 1 })}
            style={{ width: 200 }}
            allowClear
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
          >
            {paymentStatuses.map((p) => (
              <Select.Option key={p.value} value={p.value}>
                {p.label}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder={
              <span className="flex items-center gap-2 text-slate-500">
                <Package size={15} />
                <span>Trạng thái đơn hàng</span>
              </span>
            }
            value={queryParams.status || undefined}
            onChange={(val) => setQueryParams({ ...queryParams, status: val || '', page: 1 })}
            style={{ width: 220 }}
            allowClear
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
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
        columns={columns}
        dataSource={sortedOrders}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: total,
          onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, limit: pageSize }),
        }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden [&_.ant-table]:text-slate-700"
      />

      <Drawer
        title={
          <div className="flex items-center gap-2 text-slate-800 py-1">
            <Package size={18} className="text-blue-500" />
            <span className="font-bold text-base">Chi tiết Đơn hàng: {selectedOrder?.orderCode}</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        className="rounded-l-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order status section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-1.5 text-sm">
                <Clock size={16} className="text-slate-500" />
                Cập nhật trạng thái đơn hàng
              </h3>
              <Select
                value={selectedOrder.orderStatus}
                onChange={(val) => handleUpdateStatus(selectedOrder._id, val)}
                className="w-full h-10 [&>.ant-select-selector]:rounded-lg"
              >
                {statuses.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.label}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Customer shipping info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-1.5 text-sm">
                <MapPin size={16} className="text-slate-500" />
                Thông tin người nhận
              </h3>
              <div className="space-y-3 text-slate-700 text-sm">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <User size={15} className="text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-400 mr-1.5">Người nhận:</span> 
                    <span className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.fullName}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <Phone size={15} className="text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-400 mr-1.5">Số điện thoại:</span> 
                    <span className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <MapPin size={15} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-400 mr-1.5">Địa chỉ:</span> 
                    <span className="font-semibold text-slate-850">
                      {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <CreditCard size={15} className="text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-400 mr-1.5">Phương thức thanh toán:</span> 
                    <span className="uppercase font-bold text-blue-600">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product items list */}
            <div>
              <h3 className="text-slate-850 font-semibold mb-3 flex items-center gap-1.5 text-sm">
                <Package size={16} className="text-slate-500" />
                Sản phẩm đã đặt
              </h3>
              {drawerLoading ? (
                <div className="flex justify-center py-8">
                  <Spin tip="Đang tải danh sách sản phẩm..." />
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item._id} className="flex gap-3 items-center bg-white p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-all duration-200">
                      <img src={item.productId?.thumbnail} className="w-14 h-14 object-cover rounded-lg border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 font-semibold text-sm truncate">{item.productId?.name}</div>
                        <div className="text-slate-400 text-xs mt-1 font-medium">
                          {item.variantName ? <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border mr-2">{item.variantName}</span> : ''}
                          <span>Số lượng: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-slate-900 font-bold text-sm">
                        {(item.priceAtBuy * item.quantity).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Divider className="my-4 border-slate-100" />

            {/* Payment totals summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-slate-700 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-medium">Tổng tiền hàng:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-slate-450 font-medium">Giảm giá voucher:</span>
                  <span className="font-semibold">-{selectedOrder.discountAmount?.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/80">
                <span className="text-slate-850 font-bold text-base">Tổng thanh toán:</span>
                <span className="font-extrabold text-lg text-red-600">{selectedOrder.finalAmount?.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

