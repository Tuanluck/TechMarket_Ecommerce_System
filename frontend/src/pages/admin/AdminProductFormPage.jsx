import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Select, Space, Card, Divider, message, Spin, Switch, Image, Upload } from 'antd';
import { Plus, Trash2, ArrowLeft, Upload as UploadIcon } from 'lucide-react';
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
  
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const uploadThumbnail = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);

    setUploadingThumbnail(true);
    try {
      const res = await axiosInstance.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        form.setFieldsValue({ thumbnail: res.data.url });
        message.success('Tải ảnh đại diện lên thành công');
        onSuccess(res.data.url);
      } else {
        throw new Error(res.data.message || 'Lỗi không rõ');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || 'Không thể tải ảnh lên');
      onError(err);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const uploadGallery = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);

    setUploadingGallery(true);
    try {
      const res = await axiosInstance.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const currentList = form.getFieldValue('imagesList') || [];
        form.setFieldsValue({
          imagesList: [...currentList, res.data.url]
        });
        message.success(`Đã thêm ảnh vào thư viện`);
        onSuccess(res.data.url);
      } else {
        throw new Error(res.data.message || 'Lỗi không rõ');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || 'Không thể tải ảnh lên');
      onError(err);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Watch for thumbnail value to show live preview
  const thumbnailWatch = Form.useWatch('thumbnail', form);

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
            description: product.description || '',
            isActive: product.isActive !== false,
            imagesList: product.images || [],
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
      images: values.imagesList || [],
      basePrice: values.basePrice,
      stock: values.stock,
      specs: specs,
      variants: values.variants || [],
      description: values.description || '',
      isActive: values.isActive === undefined ? true : values.isActive,
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
            <p className="text-slate-500">{isEditMode ? 'Cập nhật thông tin chi tiết sản phẩm' : 'Tạo sản phẩm mới trong hệ thống'}</p>
          </div>
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
              label="Trạng thái kinh doanh"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="Đang bán" unCheckedChildren="Ẩn/Tạm ngưng" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-2">
            <div className="md:col-span-3">
              <Form.Item
                label="Ảnh đại diện (Thumbnail URL)"
                name="thumbnail"
                rules={[{ required: true, message: 'Vui lòng nhập URL hoặc tải ảnh lên' }]}
              >
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  addonAfter={
                    <Upload
                      customRequest={uploadThumbnail}
                      showUploadList={false}
                      accept="image/*"
                      beforeUpload={(file) => {
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error('Ảnh phải nhỏ hơn 5MB!');
                        }
                        return isLt5M;
                      }}
                    >
                      <span className="text-xs text-[#3b82f6] cursor-pointer font-bold flex items-center gap-1">
                        <UploadIcon size={12} />
                        Tải lên
                      </span>
                    </Upload>
                  }
                />
              </Form.Item>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-medium mb-1">Preview</span>
              <div className="w-20 h-20 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                {uploadingThumbnail ? (
                  <Spin size="small" />
                ) : thumbnailWatch ? (
                  <img src={thumbnailWatch} alt="Thumbnail preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }} />
                ) : (
                  <span className="text-slate-350 text-[10px]">No image</span>
                )}
              </div>
            </div>
          </div>

          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            className="pt-2"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả giới thiệu về sản phẩm..." />
          </Form.Item>
        </Card>

        {/* Gallery Images List */}
        <Card 
          title="Thư viện ảnh chi tiết (Product Gallery)" 
          bordered={false} 
          className="shadow-sm border border-slate-100"
          extra={
            <Upload
              customRequest={uploadGallery}
              showUploadList={false}
              multiple
              accept="image/*"
              beforeUpload={(file) => {
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!');
                }
                return isLt5M;
              }}
            >
              <Button 
                type="dashed" 
                loading={uploadingGallery} 
                icon={<UploadIcon size={14} />}
                className="flex items-center gap-1 font-bold text-xs text-[#3b82f6] border-[#3b82f6] hover:text-[#2563eb] hover:border-[#2563eb] cursor-pointer"
              >
                Tải lên nhiều ảnh
              </Button>
            </Upload>
          }
        >
          <Form.List name="imagesList">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.length === 0 && (
                  <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <span className="text-xs text-slate-400">Chưa có ảnh chi tiết nào. Hãy nhập URL hoặc bấm "Tải lên nhiều ảnh" ở góc trên.</span>
                  </div>
                )}
                {fields.map(({ key, name, ...restField }) => {
                  const imageUrl = form.getFieldValue(['imagesList', name]);
                  return (
                    <div key={key} className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <Form.Item
                          {...restField}
                          name={name}
                          rules={[{ required: true, message: 'Nhập URL ảnh chi tiết' }]}
                          noStyle
                        >
                          <Input 
                            placeholder="https://example.com/gallery-image.jpg" 
                            className="w-full" 
                            addonAfter={
                              <Upload
                                customRequest={async (options) => {
                                  const { file, onSuccess, onError } = options;
                                  const formData = new FormData();
                                  formData.append('image', file);
                                  try {
                                    const res = await axiosInstance.post('/uploads/single', formData, {
                                      headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    if (res.data.success) {
                                      const currentList = form.getFieldValue('imagesList');
                                      currentList[name] = res.data.url;
                                      form.setFieldsValue({ imagesList: [...currentList] });
                                      message.success('Thay thế ảnh thành công');
                                      onSuccess(res.data.url);
                                    }
                                  } catch (err) {
                                    message.error('Không thể tải ảnh lên');
                                    onError(err);
                                  }
                                }}
                                showUploadList={false}
                                accept="image/*"
                              >
                                <span className="text-xs text-[#3b82f6] cursor-pointer font-bold flex items-center gap-0.5">
                                  <UploadIcon size={11} />
                                  Tải lên
                                </span>
                              </Upload>
                            }
                          />
                        </Form.Item>
                      </div>
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Gallery item" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }} />
                        ) : (
                          <span className="text-slate-300 text-[9px] text-center leading-none">No preview</span>
                        )}
                      </div>
                      <Button type="text" danger onClick={() => remove(name)} icon={<Trash2 size={16} />} />
                    </div>
                  );
                })}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<Plus size={14} />}
                  className="flex items-center justify-center gap-1 border-dashed hover:border-blue-500 hover:text-blue-500 cursor-pointer"
                >
                  Thêm URL ảnh thủ công
                </Button>
              </div>
            )}
          </Form.List>
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
