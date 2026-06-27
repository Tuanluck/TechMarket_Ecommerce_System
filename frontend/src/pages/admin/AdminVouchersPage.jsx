import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, InputNumber, Select, Card, Popconfirm, message, Space, Checkbox, DatePicker, Radio } from 'antd';
import { Trash2, FolderOpen, Tag as TagIcon, Shield, CreditCard, ShoppingBag, Eye } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import dayjs from 'dayjs';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [form] = Form.useForm();

  // Watch form fields in real time for live preview ticket
  const code = Form.useWatch('code', form);
  const discountType = Form.useWatch('discountType', form);
  const discountValue = Form.useWatch('discountValue', form);
  const minOrderValue = Form.useWatch('minOrderValue', form);
  const maxDiscount = Form.useWatch('maxDiscount', form);
  const expiryDate = Form.useWatch('expiryDate', form);
  const applyScope = Form.useWatch('applyScope', form);

  const fetchVouchers = () => {
    setLoading(true);
    axiosInstance
      .get('/vouchers')
      .then((res) => {
        setVouchers(res.data.data.vouchers);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách vouchers');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Quản lý Voucher - TechMarket Admin';
    fetchVouchers();
    
    // Fetch categories and products for configuration scoping options
    axiosInstance.get('/categories').then((res) => setCategories(res.data.data)).catch(console.error);
    axiosInstance.get('/products?limit=100').then((res) => setProductsList(res.data.data.products)).catch(console.error);
  }, []);

  const onFinish = (values) => {
    setSaving(true);
    
    // Format date value for API
    const payload = {
      ...values,
      expiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined,
    };

    axiosInstance
      .post('/vouchers', payload)
      .then(() => {
        message.success('Tạo mã giảm giá thành công');
        form.resetFields();
        fetchVouchers();
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo voucher');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleSave = (status) => {
    form.setFieldsValue({ status });
    form.submit();
  };

  const handleDelete = (id) => {
    axiosInstance
      .delete(`/vouchers/${id}`)
      .then(() => {
        message.success('Xóa voucher thành công');
        fetchVouchers();
      })
      .catch((err) => {
        console.error(err);
        message.error('Lỗi khi xóa voucher');
      });
  };

  const columns = [
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-blue-605 bg-blue-50/50 px-2.5 py-1 rounded-full border border-blue-100 uppercase text-xs w-max">
            {text}
          </span>
          {record.status === 'draft' && (
            <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-medium w-max">
              Bản nháp
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type) => <span className="text-xs font-semibold text-slate-600">{type === 'percent' ? 'Phần trăm (%)' : 'Cố định (đ)'}</span>,
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (val, record) => (
        <span className="font-bold text-slate-800 text-xs">
          {record.discountType === 'percent' ? `${val}%` : `${val?.toLocaleString('vi-VN')} đ`}
        </span>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (val) => <span className="text-slate-500 text-xs">{val?.toLocaleString('vi-VN')} đ</span>,
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
      render: (val) => <span className="text-slate-500 text-xs">{val ? `${val?.toLocaleString('vi-VN')} đ` : 'Không giới hạn'}</span>,
    },
    {
      title: 'Lượt sử dụng',
      key: 'usage',
      render: (_, record) => {
        const limit = record.usageLimit ? record.usageLimit : '∞';
        return <span className="text-slate-600 text-xs font-semibold">{record.usedCount} / {limit}</span>;
      },
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => (
        <span className="text-slate-450 text-xs font-medium">
          {date ? dayjs(date).format('DD/MM/YYYY') : 'Không giới hạn'}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa voucher này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 border-none cursor-pointer">
            <Trash2 size={14} />
          </button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Voucher</h1>
        <p className="text-slate-500 text-sm">Chi tiết và Tạo mới mã giảm giá</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          discountType: 'percent',
          minOrderValue: 0,
          status: 'active',
          applicableCustomerGroups: ['all'],
          limitPerCustomer: 1,
          applicablePaymentMethods: ['all'],
          applyScope: 'all',
          applyScopeChannel: 'all',
          applicableChannels: ['website', 'app', 'messenger']
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Basic Form fields */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100/85 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 mb-4">Form Tạo Voucher Mới</h2>
            
            <Form.Item name="status" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-600">Mã Code</span>}
              name="code"
              rules={[
                { required: true, message: 'Nhập mã giảm giá' },
                { pattern: /^[A-Z0-9]+$/, message: 'Chỉ chấp nhận chữ in hoa và chữ số' },
              ]}
            >
              <Input placeholder="VÍ DỤ: SALE10" className="uppercase h-10 rounded-xl" />
            </Form.Item>

            <Form.Item label={<span className="text-xs font-bold text-slate-600">Loại giảm giá</span>} name="discountType" rules={[{ required: true }]}>
              <Select className="h-10 [&>.ant-select-selector]:rounded-xl [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center">
                <Select.Option value="percent">Phần trăm (%)</Select.Option>
                <Select.Option value="fixed">Số tiền cố định (đ)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-600">Giá trị giảm</span>}
              name="discountValue"
              rules={[{ required: true, message: 'Nhập giá trị giảm giá' }]}
            >
              <InputNumber className="w-full h-10 rounded-xl [&>div]:rounded-xl" min={1} addonAfter={discountType === 'percent' ? '%' : 'đ'} />
            </Form.Item>

            <Form.Item label={<span className="text-xs font-bold text-slate-600">Giá trị đơn hàng tối thiểu</span>} name="minOrderValue">
              <InputNumber className="w-full h-10 rounded-xl [&>div]:rounded-xl" min={0} addonAfter="đ" />
            </Form.Item>

            {discountType === 'percent' && (
              <Form.Item label={<span className="text-xs font-bold text-slate-600">Giảm tối đa (Max Discount)</span>} name="maxDiscount">
                <InputNumber className="w-full h-10 rounded-xl [&>div]:rounded-xl" min={0} placeholder="Không giới hạn" addonAfter="đ" />
              </Form.Item>
            )}

            <Form.Item label={<span className="text-xs font-bold text-slate-600">Giới hạn lượt dùng (Usage Limit)</span>} name="usageLimit">
              <InputNumber className="w-full h-10 rounded-xl [&>div]:rounded-xl" min={1} placeholder="Không giới hạn" />
            </Form.Item>

            <Form.Item label={<span className="text-xs font-bold text-slate-600">Ngày hết hạn</span>} name="expiryDate">
              <DatePicker className="w-full h-10 rounded-xl" placeholder="Chọn ngày hết hạn" />
            </Form.Item>
          </div>

          {/* Middle Panel: Configuration cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100/85 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 mb-2">Cấu hình chi tiết Voucher</h2>

              {/* Customer targeting */}
              <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Shield size={14} className="text-slate-450" />
                  <span>Giới hạn Khách hàng</span>
                </div>
                <div className="text-xs text-slate-500 mb-1 font-semibold">Nhóm khách hàng áp dụng</div>
                <Form.Item name="applicableCustomerGroups" noStyle>
                  <Checkbox.Group className="flex flex-col gap-2 p-3 bg-white border border-slate-200/60 rounded-xl w-full">
                    <Checkbox value="new" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Thành viên mới</span></Checkbox>
                    <Checkbox value="gold" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Thành viên vàng</span></Checkbox>
                    <Checkbox value="all" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Tất cả</span></Checkbox>
                  </Checkbox.Group>
                </Form.Item>
                <div className="mt-3">
                  <span className="text-xs text-slate-500 font-semibold">Giới hạn mỗi khách hàng</span>
                  <Form.Item name="limitPerCustomer" className="mt-1 mb-0">
                    <InputNumber min={1} className="w-full h-9 rounded-xl [&>div]:rounded-xl" />
                  </Form.Item>
                </div>
              </div>

              {/* Payment methods */}
              <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <CreditCard size={14} className="text-slate-450" />
                  <span>Giới hạn Phương thức Thanh toán</span>
                </div>
                <Form.Item name="applicablePaymentMethods" noStyle>
                  <Checkbox.Group className="flex flex-col gap-2 p-3 bg-white border border-slate-200/60 rounded-xl w-full">
                    <Checkbox value="momo" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Ví MoMo</span></Checkbox>
                    <Checkbox value="zalopay" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">ZaloPay</span></Checkbox>
                    <Checkbox value="cod" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">COD</span></Checkbox>
                    <Checkbox value="card" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Thẻ Tín dụng</span></Checkbox>
                    <Checkbox value="all" className="hover:bg-slate-50 p-1.5 rounded-lg w-full transition-colors flex items-center gap-2"><span className="text-xs font-semibold text-slate-600">Tất cả</span></Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </div>

              {/* Product scopes */}
              <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <ShoppingBag size={14} className="text-slate-450" />
                  <span>Giới hạn Danh mục/Sản phẩm</span>
                </div>
                <Form.Item name="applyScope" noStyle>
                  <Radio.Group optionType="button" buttonStyle="solid" className="w-full flex justify-between gap-1 mb-2">
                    <Radio.Button value="all" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">All</Radio.Button>
                    <Radio.Button value="category" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">Category</Radio.Button>
                    <Radio.Button value="product" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">Product</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                {applyScope === 'category' && (
                  <Form.Item name="applicableCategories" className="mb-0 mt-2">
                    <Select mode="multiple" placeholder="Chọn danh mục áp dụng" className="w-full">
                      {categories.map((c) => (
                        <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
                {applyScope === 'product' && (
                  <Form.Item name="applicableProducts" className="mb-0 mt-2">
                    <Select mode="multiple" placeholder="Chọn sản phẩm áp dụng" className="w-full max-h-32 overflow-y-auto">
                      {productsList.map((p) => (
                        <Select.Option key={p._id} value={p._id}>{p.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </div>

              {/* Scope channels */}
              <div className="space-y-2 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Eye size={14} className="text-slate-450" />
                  <span>Phạm vi áp dụng</span>
                </div>
                <Form.Item name="applyScopeChannel" noStyle>
                  <Radio.Group optionType="button" buttonStyle="solid" className="w-full flex justify-between gap-1 mb-2">
                    <Radio.Button value="online" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">Online</Radio.Button>
                    <Radio.Button value="in-store" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">In-store</Radio.Button>
                    <Radio.Button value="all" className="flex-1 text-center text-xs h-8 leading-7 rounded-lg">All</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <div className="mt-3">
                  <span className="text-xs text-slate-500 font-semibold">Kênh áp dụng</span>
                  <Form.Item name="applicableChannels" className="mt-1 mb-0">
                    <Select mode="multiple" placeholder="Chọn kênh áp dụng" className="w-full">
                      <Select.Option value="website">Website</Select.Option>
                      <Select.Option value="app">Mobile App</Select.Option>
                      <Select.Option value="messenger">Facebook Messenger</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live preview */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            <h2 className="text-sm font-bold text-slate-800 ml-1">Bản xem trước Voucher</h2>
            
            {/* CSS Ticket shape (Divided structure) */}
            <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden min-h-[240px] flex flex-col hover:shadow-lg transition-shadow duration-300">
              {/* Top portion */}
              <div className="p-5 flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-transparent">
                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full tracking-wider mb-2">
                  Mã: {code ? code.toUpperCase() : 'SALE10'}
                </span>
                <span className="text-3xl font-black text-slate-800 my-1">
                  {discountType === 'percent' 
                    ? `Giảm ${discountValue || 10}%` 
                    : `Giảm ${(discountValue || 50000).toLocaleString('vi-VN')} đ`}
                </span>
              </div>
              
              {/* Ticket Divider Line with Left & Right Cutout Circles */}
              <div className="relative flex items-center py-1.5 bg-slate-50/30">
                {/* Left Cutout Hole */}
                <div className="absolute -left-3 w-6 h-6 bg-slate-50 border-r border-slate-200 rounded-full z-10" />
                {/* Right Cutout Hole */}
                <div className="absolute -right-3 w-6 h-6 bg-slate-50 border-l border-slate-200 rounded-full z-10" />
                {/* Dashed Line */}
                <div className="w-full border-t border-dashed border-slate-200 mx-3" />
              </div>

              {/* Bottom portion */}
              <div className="p-4 bg-slate-50/70 text-center text-[10px] text-slate-500 font-semibold space-y-1 rounded-b-2xl">
                <div>Hạn sử dụng: {expiryDate ? dayjs(expiryDate).format('DD/MM/YYYY') : 'Không giới hạn'}</div>
                {discountType === 'percent' && maxDiscount > 0 && (
                  <div>Giảm tối đa: {maxDiscount.toLocaleString('vi-VN')} đ</div>
                )}
                {minOrderValue > 0 && (
                  <div>Đơn tối thiểu: {minOrderValue.toLocaleString('vi-VN')} đ</div>
                )}
                <div className="text-[8px] text-amber-600 font-bold uppercase tracking-widest mt-1">TechMarket Premium</div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="lg:col-span-12 flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4 bg-white p-4 rounded-xl border">
            <Button
              type="text"
              onClick={() => form.resetFields()}
              className="text-slate-505 font-bold hover:bg-slate-50 rounded-lg px-4"
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              loading={saving && form.getFieldValue('status') === 'draft'}
              className="border border-slate-200 hover:border-slate-350 font-bold text-slate-655 bg-white rounded-lg px-5 h-10"
            >
              Lưu Bản nháp
            </Button>
            <Button
              type="primary"
              onClick={() => handleSave('active')}
              loading={saving && form.getFieldValue('status') === 'active'}
              className="bg-blue-600 hover:bg-blue-700 font-black text-white rounded-lg px-6 h-10 border-none shadow-sm hover:shadow"
            >
              Lưu và Kích hoạt
            </Button>
          </div>

          {/* Voucher list at the bottom */}
          <div className="lg:col-span-12 mt-6">
            <Card title={<span className="text-sm font-bold text-slate-800">Danh sách Vouchers</span>} className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
              <Table
                columns={columns}
                dataSource={vouchers}
                rowKey="_id"
                loading={loading}
                className="border border-slate-100 rounded-xl overflow-hidden [&_.ant-table]:text-slate-700"
              />
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
