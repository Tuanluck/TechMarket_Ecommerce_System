import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Popconfirm, message, Avatar } from 'antd';
import { Search, UserCheck, UserX, Shield, User } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 15,
    q: '',
    role: '',
  });

  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (queryParams.page) params.page = queryParams.page;
    if (queryParams.limit) params.limit = queryParams.limit;
    if (queryParams.q) params.q = queryParams.q;
    if (queryParams.role) params.role = queryParams.role;

    axiosInstance
      .get('/admin/users', { params })
      .then((res) => {
        setUsers(res.data.data.users);
        setTotal(res.data.data.total);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách tài khoản');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Quản lý tài khoản - TechMarket Admin';
    fetchUsers();
  }, [queryParams]);

  const handleToggleStatus = (userId) => {
    axiosInstance
      .patch(`/admin/users/${userId}/toggle-status`)
      .then(() => {
        message.success('Cập nhật trạng thái tài khoản thành công');
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Có lỗi xảy ra khi khóa/mở khóa tài khoản');
      });
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar}
            icon={<User size={16} />}
            className="bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
            size={36}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 text-sm truncate leading-tight">{text || 'N/A'}</span>
            <span className="text-xs text-slate-400 truncate mt-0.5">{record.email || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <span className="text-slate-600 font-medium text-xs">{phone || 'Chưa cập nhật'}</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        if (role === 'admin') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
              Admin
            </span>
          );
        }
        if (role === 'staff') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
              Staff
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
            Customer
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => {
        if (isActive) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              Hoạt động
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100">
            Đang khóa
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        const isSelf = record._id === currentUser?._id;
        if (isSelf) return <span className="text-slate-400 text-xs italic">Tài khoản của bạn</span>;

        return (
          <Popconfirm
            title={`Bạn có chắc chắn muốn ${record.isActive ? 'Khóa' : 'Mở khóa'} tài khoản này?`}
            onConfirm={() => handleToggleStatus(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: record.isActive }}
          >
            {record.isActive ? (
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-650 border border-red-200 hover:bg-red-100 hover:text-red-750 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <UserX size={13} />
                Khóa
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-100 border-none"
              >
                <UserCheck size={13} />
                Mở khóa
              </button>
            )}
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tài khoản</h1>
        <p className="text-slate-500 text-sm">Khóa hoặc kích hoạt tài khoản người dùng trong hệ thống</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Input
            placeholder="Tìm theo Tên hoặc Email..."
            prefix={<Search size={16} className="text-slate-400" />}
            value={queryParams.q}
            onChange={(e) => setQueryParams({ ...queryParams, q: e.target.value, page: 1 })}
            style={{ width: 260 }}
            allowClear
            className="rounded-xl h-10 border-slate-200 hover:border-slate-350 focus:border-blue-500"
          />
          
          <Select
            placeholder={
              <span className="flex items-center gap-2 text-slate-500">
                <Shield size={15} />
                <span>Tất cả vai trò</span>
              </span>
            }
            value={queryParams.role || undefined}
            onChange={(val) => setQueryParams({ ...queryParams, role: val || '', page: 1 })}
            style={{ width: 180 }}
            allowClear
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
          >
            <Select.Option value="customer">Khách hàng (customer)</Select.Option>
            <Select.Option value="staff">Nhân viên (staff)</Select.Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={users}
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
    </div>
  );
}
