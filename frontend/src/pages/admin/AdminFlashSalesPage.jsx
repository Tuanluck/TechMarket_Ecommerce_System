import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Card, Popconfirm, message, Space, DatePicker, InputNumber, Divider } from 'antd';
import { Plus, Trash2, Percent, Clock, Calendar, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import dayjs from 'dayjs';

export default function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchFlashSales = () => {
    setLoading(true);
    axiosInstance
      .get('/flash-sales')
      .then((res) => {
        setFlashSales(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải danh sách Flash Sale');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Quản lý Flash Sale - TechMarket Admin';
    fetchFlashSales();

    // Fetch products for selection
    axiosInstance
      .get('/products', { params: { limit: 50 } })
      .then((res) => {
        setProducts(res.data.data.products);
      })
      .catch(console.error);
  }, []);

  const onFinish = (values) => {
    setSaving(true);
    const payload = {
      name: values.name,
      startTime: values.startTime ? values.startTime.toISOString() : undefined,
      endTime: values.endTime ? values.endTime.toISOString() : undefined,
      status: values.status || 'upcoming',
      products: values.products || [],
    };

    axiosInstance
      .post('/flash-sales', payload)
      .then(() => {
        message.success('Tạo chương trình Flash Sale thành công');
        form.resetFields();
        fetchFlashSales();
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Lỗi khi tạo Flash Sale');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleDelete = (id) => {
    axiosInstance
      .delete(`/flash-sales/${id}`)
      .then(() => {
        message.success('Xóa Flash Sale thành công');
        fetchFlashSales();
      })
      .catch((err) => {
        console.error(err);
        message.error('Lỗi khi xóa Flash Sale');
      });
  };

  const columns = [
    {
      title: 'Chiến dịch',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold text-slate-800 text-sm">{text}</span>,
    },
    {
      title: 'Thời gian diễn ra',
      key: 'timeRange',
      render: (_, record) => {
        const start = dayjs(record.startTime).format('HH:mm DD/MM/YYYY');
        const end = dayjs(record.endTime).format('HH:mm DD/MM/YYYY');
        return (
          <div className="flex flex-col text-xs text-slate-600 font-medium space-y-0.5">
            <span className="flex items-center gap-1"><span className="text-slate-400">Từ:</span> {start}</span>
            <span className="flex items-center gap-1"><span className="text-slate-400">Đến:</span> {end}</span>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'active') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <RefreshCw size={11} className="text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
              Đang diễn ra
            </span>
          );
        }
        if (status === 'upcoming') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
              <Clock size={11} className="text-amber-500" />
              Sắp diễn ra
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <CheckCircle2 size={11} className="text-slate-400" />
            Đã kết thúc
          </span>
        );
      },
    },
    {
      title: 'Sản phẩm tham gia',
      dataIndex: 'products',
      key: 'productCount',
      render: (prods) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
          {prods?.length || 0} sản phẩm
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa chương trình này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-750 transition-colors duration-200 border-none cursor-pointer">
            <Trash2 size={14} />
          </button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Flash Sale</h1>
        <p className="text-slate-500 text-sm">Tạo các chiến dịch Flash Sale giảm giá có thời hạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form creation */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-850 border-b border-slate-50 pb-2 mb-4">Tạo Chiến Dịch Mới</h2>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ status: 'upcoming' }}
          >
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Tên chương trình</span>}
              name="name"
              rules={[{ required: true, message: 'Nhập tên chương trình Flash Sale' }]}
            >
              <Input placeholder="Ví dụ: Flash Sale Cuối Tuần" className="h-10 rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Thời gian bắt đầu</span>}
              name="startTime"
              rules={[{ required: true, message: 'Chọn thời gian bắt đầu' }]}
            >
              <DatePicker showTime placeholder="Chọn thời gian bắt đầu" className="w-full h-10 rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-semibold text-slate-600">Thời gian kết thúc</span>}
              name="endTime"
              rules={[{ required: true, message: 'Chọn thời gian kết thúc' }]}
            >
              <DatePicker showTime placeholder="Chọn thời gian kết thúc" className="w-full h-10 rounded-xl" />
            </Form.Item>

            <Form.Item label={<span className="text-xs font-semibold text-slate-600">Trạng thái</span>} name="status" rules={[{ required: true }]}>
              <Select className="h-10 [&>.ant-select-selector]:rounded-xl [&>.ant-select-selector]:h-full [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center">
                <Select.Option value="upcoming">
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-amber-500" /> Sắp diễn ra</span>
                </Select.Option>
                <Select.Option value="active">
                  <span className="flex items-center gap-1.5"><RefreshCw size={13} className="text-emerald-500" /> Đang diễn ra</span>
                </Select.Option>
                <Select.Option value="ended">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-slate-400" /> Đã kết thúc</span>
                </Select.Option>
              </Select>
            </Form.Item>

            <Divider className="my-4 border-slate-100"><span className="text-xs text-slate-450 font-bold">Sản phẩm tham gia</span></Divider>

            <Form.List name="products">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="border border-slate-100 bg-slate-50/50 rounded-2xl relative shadow-sm hover:shadow-md transition-shadow">
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                        icon={<Trash2 size={14} />}
                        className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center p-0 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-none"
                      />
                      <div className="space-y-2 mt-4 p-1">
                        <Form.Item
                          {...restField}
                          name={[name, 'productId']}
                          rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                          className="mb-1"
                        >
                          <Select placeholder="Chọn sản phẩm" className="w-full h-9 [&>.ant-select-selector]:rounded-lg">
                            {products.map((p) => (
                              <Select.Option key={p._id} value={p._id}>
                                {p.name} ({(p.basePrice || 0).toLocaleString('vi-VN')} đ)
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-2">
                          <Form.Item
                            {...restField}
                            name={[name, 'promoPrice']}
                            rules={[{ required: true, message: 'Nhập giá KM' }]}
                            className="mb-0"
                          >
                            <InputNumber placeholder="Giá KM" className="w-full h-8 rounded-lg" min={0} addonAfter="đ" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxQuantity']}
                            rules={[{ required: true, message: 'Nhập SL bán' }]}
                            className="mb-0"
                          >
                            <InputNumber placeholder="SL bán" className="w-full h-8 rounded-lg" min={1} />
                          </Form.Item>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Form.Item className="mb-0">
                    <Button type="dashed" onClick={() => add()} block className="rounded-xl border-dashed h-9 font-semibold text-slate-550 border-slate-300 hover:text-blue-500 hover:border-blue-400" icon={<Plus size={14} className="inline mr-1" />}>
                      Thêm sản phẩm
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={saving}
              icon={<Percent size={15} className="inline mr-1" />}
              className="bg-blue-600 hover:bg-blue-700 mt-5 h-10 rounded-xl border-none font-bold text-white shadow-sm shadow-blue-100"
            >
              Tạo Chiến Dịch
            </Button>
          </Form>
        </div>

        {/* Right Column: Campaigns list */}
        <div className="lg:col-span-8">
          <Card title={<span className="text-sm font-bold text-slate-800">Danh sách các chương trình Flash Sale</span>} className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
            <Table
              columns={columns}
              dataSource={flashSales}
              rowKey="_id"
              loading={loading}
              className="border border-slate-100 rounded-xl overflow-hidden [&_.ant-table]:text-slate-700"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
