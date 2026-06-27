import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Popconfirm, message } from 'antd';
import { Plus, Edit2, Trash2, Search, FolderOpen, Tag as TagIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    q: '',
    categoryId: '',
    brandId: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Quản lý sản phẩm - TechMarket Admin';
    // Fetch categories and brands
    axiosInstance.get('/categories').then((res) => setCategories(res.data.data)).catch(console.error);
    axiosInstance.get('/brands').then((res) => setBrands(res.data.data)).catch(console.error);
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const params = {};
    if (queryParams.page) params.page = queryParams.page;
    if (queryParams.limit) params.limit = queryParams.limit;
    if (queryParams.q) params.q = queryParams.q;
    if (queryParams.categoryId) params.categoryId = queryParams.categoryId;
    if (queryParams.brandId) params.brandId = queryParams.brandId;

    axiosInstance
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.data.products);
        setTotal(res.data.data.pagination.total);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách sản phẩm');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [queryParams]);

  const handleDelete = (id) => {
    axiosInstance
      .delete(`/products/${id}`)
      .then(() => {
        message.success('Xóa sản phẩm thành công');
        fetchProducts();
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Không thể xóa sản phẩm');
      });
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 90,
      render: (url) => (
        <img
          src={url}
          alt="product"
          className="w-12 h-12 object-cover rounded-xl border border-slate-100/80 shadow-sm"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-slate-800 text-sm leading-snug">{text}</span>
          <span className="text-[10px] font-mono text-slate-450 mt-1 truncate">Slug: {record.slug}</span>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['categoryId', 'name'],
      key: 'category',
      render: (cat) => <span className="text-slate-600 font-semibold text-xs">{cat || 'N/A'}</span>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['brandId', 'name'],
      key: 'brand',
      render: (brand) => <span className="text-slate-600 font-semibold text-xs">{brand || 'N/A'}</span>,
    },
    {
      title: 'Giá bán',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => (
        <span className="font-bold text-slate-900 text-sm">
          {price?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        if (stock === 0) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-650 border border-red-100">
              Hết hàng
            </span>
          );
        }
        if (stock < 5) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-650 border border-amber-100">
              Chỉ còn {stock}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            Còn hàng: {stock}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/products/edit/${record._id}`)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-150 hover:text-blue-750 transition-colors duration-205 cursor-pointer border-none shadow-sm"
            title="Sửa"
          >
            <Edit2 size={13} />
          </button>
          
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-150 hover:text-red-750 transition-colors duration-205 cursor-pointer border-none shadow-sm"
              title="Xóa"
            >
              <Trash2 size={13} />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-slate-500 text-sm">Danh sách sản phẩm trên toàn hệ thống</p>
        </div>
        <Link to="/admin/products/new">
          <button className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition-all duration-200 border-none cursor-pointer">
            <Plus size={15} />
            Thêm sản phẩm
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
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
                <FolderOpen size={15} />
                <span>Tất cả danh mục</span>
              </span>
            }
            value={queryParams.categoryId || undefined}
            onChange={(val) => setQueryParams({ ...queryParams, categoryId: val || '', page: 1 })}
            style={{ width: 200 }}
            allowClear
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
          >
            {categories.map((c) => (
              <Select.Option key={c._id} value={c._id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder={
              <span className="flex items-center gap-2 text-slate-500">
                <TagIcon size={15} />
                <span>Tất cả thương hiệu</span>
              </span>
            }
            value={queryParams.brandId || undefined}
            onChange={(val) => setQueryParams({ ...queryParams, brandId: val || '', page: 1 })}
            style={{ width: 200 }}
            allowClear
            className="rounded-xl h-10 [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:rounded-xl"
          >
            {brands.map((b) => (
              <Select.Option key={b._id} value={b._id}>
                {b.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={products}
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
