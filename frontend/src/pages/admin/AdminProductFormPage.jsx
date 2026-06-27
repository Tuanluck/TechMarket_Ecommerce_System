import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Select, Space, Card, Divider, message, Spin } from 'antd';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function AdminProductFormPage() {
  const { slug } = useParams();
  const isEditMode = !!slug;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productId, setProductId] = useState(null);

  // Simple slugify function
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s-]|_)+/g, '') // remove special chars
      .replace(/\s+/g, '-') // collapse whitespace
      .replace(/-+/g, '-') // collapse dashes
      .trim();
  };

  const handleNameChange = (e) => {
    if (!isEditMode) {
      const generatedSlug = slugify(e.target.value);
      form.setFieldsValue({ slug: generatedSlug });
    }
  };

  useEffect(() => {
    document.title = isEditMode ? 'Sửa sản phẩm - TechMarket Admin' : 'Thêm sản phẩm mới - TechMarket Admin';

    setLoading(true);
    // Fetch categories and brands
    Promise.all([axiosInstance.get('/categories'), axiosInstance.get('/brands')])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.data);
        setBrands(brandRes.data.data);

        if (isEditMode) {
          // Fetch product detail to edit
          return axiosInstance.get(`/products/${slug}`);
        }
      })
      .then((prodRes) => {
        if (prodRes && prodRes.data.success) {
          const product = prodRes.data.data;
          setProductId(product._id);

          // Convert specs from Map/Object to array of { key, value } for Form.List
          const specsArray = Object.entries(product.specs || {}).map(([key, value]) => ({
            key,
            value,
          }));

          form.setFieldsValue({
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId?._id || product.categoryId,
            brandId: product.brandId?._id || product.brandId,
            thumbnail: product.thumbnail,
            basePrice: product.basePrice,
            stock: product.stock,
            specsList: specsArray,
            variants: product.variants || [],
          });
        }
      })
      .catch((err) => {
        console.error(err);
        message.error('Không thể tải thông tin sản phẩm hoặc danh mục');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, isEditMode, form]);

  const onFinish = (values) => {
    setSaving(true);

    // Convert specsList array back to specs object
    const specs = {};
    if (values.specsList) {
      values.specsList.forEach((item) => {
        if (item && item.key) {
          specs[item.key] = item.value || '';
        }
      });
    }

    const payload = {
      name: values.name,
      slug: values.slug,
      categoryId: values.categoryId,
      brandId: values.brandId,
      thumbnail: values.thumbnail,
      basePrice: values.basePrice,
      stock: values.stock,
      specs: specs,
      variants: values.variants || [],
    };

    const request = isEditMode
      ? axiosInstance.put(`/products/${productId}`, payload)
      : axiosInstance.post('/products', payload);

    request
      .then(() => {
        message.success(isEditMode ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
        navigate('/admin/products');
      })
      .catch((err) => {
        console.error(err);
        message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p className="text-slate-500">{isEditMode ? 'Cập nhật thông tin chi tiết sản phẩm' : 'Tạo sản phẩm mới trong hệ thống'}</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional" className="space-y-6">
        <Card title="Thông tin cơ bản" bordered={false} className="shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input onChange={handleNameChange} placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item
              label="Slug sản phẩm"
              name="slug"
              rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
            >
              <Input placeholder="Slug (đường dẫn URL)" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map((c) => (
                  <Select.Option key={c._id} value={c._id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Thương hiệu"
              name="brandId"
              rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
            >
              <Select placeholder="Chọn thương hiệu">
                {brands.map((b) => (
                  <Select.Option key={b._id} value={b._id}>
                    {b.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Giá gốc (Base Price)"
              name="basePrice"
              rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
            >
              <InputNumber
                className="w-full"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                addonAfter="đ"
              />
            </Form.Item>

            <Form.Item
              label="Số lượng tồn kho"
              name="stock"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện (Thumbnail URL)"
              name="thumbnail"
              rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          </div>
        </Card>

        <Card title="Thông số kỹ thuật (Specifications)" bordered={false} className="shadow-sm border border-slate-100">
          <Form.List name="specsList">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} className="flex w-full items-baseline" align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[{ required: true, message: 'Nhập tên thông số' }]}
                    >
                      <Input placeholder="Tên thông số (Ví dụ: CPU)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: 'Nhập giá trị' }]}
                    >
                      <Input placeholder="Giá trị (Ví dụ: Apple M1)" />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<Trash2 size={16} />} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} className="inline mr-1" />}>
                    Thêm thông số kỹ thuật
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Card>

        <Card title="Biến thể sản phẩm (Variants)" bordered={false} className="shadow-sm border border-slate-100">
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" className="border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700 text-sm">Biến thể #{name + 1}</span>
                      <Button type="text" danger onClick={() => remove(name)} icon={<Trash2 size={16} />} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Form.Item {...restField} label="Màu sắc" name={[name, 'color']}>
                        <Input placeholder="Ví dụ: Xám" />
                      </Form.Item>
                      <Form.Item {...restField} label="Cấu hình" name={[name, 'specs']}>
                        <Input placeholder="Ví dụ: 8GB/256GB" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Giá"
                        name={[name, 'price']}
                        rules={[{ required: true, message: 'Nhập giá' }]}
                      >
                        <InputNumber className="w-full" min={0} addonAfter="đ" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Tồn kho"
                        name={[name, 'stock']}
                        rules={[{ required: true, message: 'Nhập tồn kho' }]}
                      >
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} className="inline mr-1" />}>
                    Thêm biến thể sản phẩm
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate('/admin/products')}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Lưu sản phẩm
          </Button>
        </div>
      </Form>
    </div>
  );
}
