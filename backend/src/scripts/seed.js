const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Token = require('../models/Token');
const Voucher = require('../models/Voucher');
const FlashSale = require('../models/FlashSale');

const seedData = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('❌ Thất bại: Không tìm thấy MONGODB_URI hoặc MONGO_URI trong biến môi trường.');
        process.exit(1);
    }

    try {
        console.log('🔄 Đang khởi tạo kết nối tới MongoDB...');
        await mongoose.connect(mongoUri, {
            dbName: process.env.DB_NAME || 'techmarket_db',
        });
        console.log('✅ Kết nối cơ sở dữ liệu thành công!');

        // 1. Dọn dẹp dữ liệu cũ
        console.log('🧹 Đang dọn dẹp toàn bộ dữ liệu cũ...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Brand.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        await OrderItem.deleteMany({});
        await Token.deleteMany({});
        await Voucher.deleteMany({});
        await FlashSale.deleteMany({});
        console.log('✅ Đã dọn dẹp xong.');

        // 2. Tạo Categories
        console.log('📝 Đang tạo các danh mục...');
        const categoriesData = [
            { name: 'Điện thoại', slug: 'dien-thoai', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
            { name: 'Laptop', slug: 'laptop', image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=500' },
            { name: 'Máy tính bảng', slug: 'may-tinh-bang', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
            { name: 'Tai nghe', slug: 'tai-nghe', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
            { name: 'Phụ kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500' }
        ];
        const categories = {};
        for (const cat of categoriesData) {
            const doc = await Category.create(cat);
            categories[cat.slug] = doc._id;
        }
        console.log('✅ Đã tạo các danh mục thành công.');

        // 3. Tạo Brands
        console.log('📝 Đang tạo các thương hiệu...');
        const brandsData = [
            { name: 'Apple', slug: 'apple', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500' },
            { name: 'Samsung', slug: 'samsung', image: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=500' },
            { name: 'Xiaomi', slug: 'xiaomi', image: 'https://images.unsplash.com/photo-1601784551446-20c9e09cd90f?w=500' },
            { name: 'Dell', slug: 'dell', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
            { name: 'Sony', slug: 'sony', image: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=500' }
        ];
        const brands = {};
        for (const brand of brandsData) {
            const doc = await Brand.create(brand);
            brands[brand.slug] = doc._id;
        }
        console.log('✅ Đã tạo các thương hiệu thành công.');

        // 4. Tạo Admin User
        console.log('📝 Đang tạo tài khoản Admin...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await User.create({
            fullName: 'TechMarket Admin',
            email: 'admin@techmarket.vn',
            password: hashedPassword,
            role: 'admin',
            phone: '0987654321',
            isActive: true
        });
        console.log('✅ Đã tạo tài khoản Admin thành công.');

        // 5. Tạo các sản phẩm (15 sản phẩm)
        console.log('📝 Đang tạo danh sách sản phẩm mẫu...');
        const productsData = [
            {
                name: 'iPhone 15 Pro Max',
                slug: 'iphone-15-pro-max',
                categoryId: categories['dien-thoai'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
                images: [
                    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
                    'https://images.unsplash.com/photo-1695048133096-7c98c1192db8?w=500'
                ],
                basePrice: 29990000,
                stock: 50,
                specs: {
                    'Màn hình': '6.7 inch, OLED',
                    'Chip': 'Apple A17 Pro',
                    'RAM': '8GB',
                    'Bộ nhớ trong': '256GB'
                },
                variants: [
                    { color: 'Titan tự nhiên', specs: '256GB', price: 29990000, stock: 30 },
                    { color: 'Titan xanh', specs: '256GB', price: 29990000, stock: 20 }
                ]
            },
            {
                name: 'Samsung Galaxy S24 Ultra',
                slug: 'samsung-galaxy-s24-ultra',
                categoryId: categories['dien-thoai'],
                brandId: brands['samsung'],
                thumbnail: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=500',
                images: ['https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=500'],
                basePrice: 28990000,
                stock: 40,
                specs: {
                    'Màn hình': '6.8 inch, Dynamic AMOLED 2X',
                    'Chip': 'Snapdragon 8 Gen 3 for Galaxy',
                    'RAM': '12GB',
                    'Bộ nhớ trong': '256GB'
                },
                variants: [
                    { color: 'Xám Titan', specs: '256GB', price: 28990000, stock: 25 },
                    { color: 'Đen Titan', specs: '256GB', price: 28990000, stock: 15 }
                ]
            },
            {
                name: 'Xiaomi 14 Ultra',
                slug: 'xiaomi-14-ultra',
                categoryId: categories['dien-thoai'],
                brandId: brands['xiaomi'],
                thumbnail: 'https://images.unsplash.com/photo-1601784551446-20c9e09cd90f?w=500',
                images: [],
                basePrice: 24990000,
                stock: 30,
                specs: {
                    'Màn hình': '6.73 inch, AMOLED',
                    'Chip': 'Snapdragon 8 Gen 3',
                    'RAM': '16GB',
                    'Bộ nhớ trong': '512GB'
                },
                variants: [
                    { color: 'Đen', specs: '512GB', price: 24990000, stock: 20 },
                    { color: 'Trắng', specs: '512GB', price: 24990000, stock: 10 }
                ]
            },
            {
                name: 'MacBook Pro M3 Pro 14"',
                slug: 'macbook-pro-m3-pro-14',
                categoryId: categories['laptop'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                images: [],
                basePrice: 49990000,
                stock: 25,
                specs: {
                    'Màn hình': '14.2 inch, Liquid Retina XDR',
                    'Chip': 'Apple M3 Pro',
                    'RAM': '18GB',
                    'Bộ nhớ trong': '512GB'
                },
                variants: [
                    { color: 'Space Black', specs: '18GB/512GB', price: 49990000, stock: 15 },
                    { color: 'Silver', specs: '18GB/512GB', price: 49990000, stock: 10 }
                ]
            },
            {
                name: 'MacBook Air M3 13"',
                slug: 'macbook-air-m3-13',
                categoryId: categories['laptop'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                images: [],
                basePrice: 27990000,
                stock: 35,
                specs: {
                    'Màn hình': '13.6 inch, Liquid Retina',
                    'Chip': 'Apple M3',
                    'RAM': '8GB',
                    'Bộ nhớ trong': '256GB'
                },
                variants: []
            },
            {
                name: 'Dell XPS 15 9530',
                slug: 'dell-xps-15-9530',
                categoryId: categories['laptop'],
                brandId: brands['dell'],
                thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
                images: [],
                basePrice: 45990000,
                stock: 20,
                specs: {
                    'Màn hình': '15.6 inch, FHD+',
                    'Chip': 'Intel Core i7-13700H',
                    'RAM': '16GB',
                    'Card đồ họa': 'RTX 4050',
                    'Bộ nhớ trong': '512GB'
                },
                variants: []
            },
            {
                name: 'iPad Pro M4 11"',
                slug: 'ipad-pro-m4-11',
                categoryId: categories['may-tinh-bang'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
                images: [],
                basePrice: 28990000,
                stock: 30,
                specs: {
                    'Màn hình': '11 inch, Ultra Retina Tandem OLED',
                    'Chip': 'Apple M4',
                    'RAM': '8GB',
                    'Bộ nhớ trong': '256GB'
                },
                variants: [
                    { color: 'Space Black', specs: '256GB', price: 28990000, stock: 15 },
                    { color: 'Silver', specs: '256GB', price: 28990000, stock: 15 }
                ]
            },
            {
                name: 'Samsung Galaxy Tab S9 Ultra',
                slug: 'samsung-galaxy-tab-s9-ultra',
                categoryId: categories['may-tinh-bang'],
                brandId: brands['samsung'],
                thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
                images: [],
                basePrice: 25990000,
                stock: 25,
                specs: {
                    'Màn hình': '14.6 inch, Dynamic AMOLED 2X',
                    'Chip': 'Snapdragon 8 Gen 2',
                    'RAM': '12GB',
                    'Bộ nhớ trong': '256GB'
                },
                variants: []
            },
            {
                name: 'AirPods Pro 2 USB-C',
                slug: 'airpods-pro-2-usb-c',
                categoryId: categories['tai-nghe'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1588449668338-d1517824e44f?w=500',
                images: [],
                basePrice: 5790000,
                stock: 60,
                specs: {
                    'Kết nối': 'Bluetooth 5.3',
                    'Chống ồn': 'Chủ động ANC',
                    'Cổng sạc': 'USB-C / MagSafe'
                },
                variants: []
            },
            {
                name: 'Sony WH-1000XM5',
                slug: 'sony-wh-1000xm5',
                categoryId: categories['tai-nghe'],
                brandId: brands['sony'],
                thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
                images: [],
                basePrice: 7990000,
                stock: 45,
                specs: {
                    'Kiểu tai nghe': 'Over-ear',
                    'Thời lượng pin': 'Đến 30 giờ',
                    'Chống ồn': 'Chủ động ANC'
                },
                variants: [
                    { color: 'Đen', specs: 'Tiêu chuẩn', price: 7990000, stock: 25 },
                    { color: 'Bạc', specs: 'Tiêu chuẩn', price: 7990000, stock: 20 }
                ]
            },
            {
                name: 'Sony WF-1000XM5',
                slug: 'sony-wf-1000xm5',
                categoryId: categories['tai-nghe'],
                brandId: brands['sony'],
                thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
                images: [],
                basePrice: 5990000,
                stock: 50,
                specs: {
                    'Kiểu tai nghe': 'In-ear True Wireless',
                    'Chống ồn': 'Chủ động ANC',
                    'Thời lượng pin': 'Đến 8 giờ (tai nghe)'
                },
                variants: []
            },
            {
                name: 'Apple Watch Series 9 GPS 41mm',
                slug: 'apple-watch-series-9-gps-41mm',
                categoryId: categories['phu-kien'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
                images: [],
                basePrice: 9490000,
                stock: 30,
                specs: {
                    'Màn hình': 'OLED Always-On Retina',
                    'Chip': 'Apple S9 SiP',
                    'Đo SpO2': 'Có'
                },
                variants: [
                    { color: 'Đen', specs: 'Silicon', price: 9490000, stock: 15 },
                    { color: 'Hồng', specs: 'Silicon', price: 9490000, stock: 15 }
                ]
            },
            {
                name: 'Samsung Galaxy Watch 6 LTE 44mm',
                slug: 'samsung-galaxy-watch-6-lte-44mm',
                categoryId: categories['phu-kien'],
                brandId: brands['samsung'],
                thumbnail: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500',
                images: [],
                basePrice: 7490000,
                stock: 25,
                specs: {
                    'Màn hình': '1.5 inch, Super AMOLED',
                    'Hệ điều hành': 'Wear OS powered by Samsung',
                    'Đo điện tâm đồ (ECG)': 'Có'
                },
                variants: []
            },
            {
                name: 'Sạc nhanh Apple 20W Type-C USB-C',
                slug: 'sac-nhanh-apple-20w-type-c-usb-c',
                categoryId: categories['phu-kien'],
                brandId: brands['apple'],
                thumbnail: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
                images: [],
                basePrice: 550000,
                stock: 100,
                specs: {
                    'Công suất': '20W',
                    'Cổng đầu ra': 'USB-C'
                },
                variants: []
            },
            {
                name: 'Sạc dự phòng Xiaomi 20000mAh',
                slug: 'sac-du-phong-xiaomi-20000mah',
                categoryId: categories['phu-kien'],
                brandId: brands['xiaomi'],
                thumbnail: 'https://images.unsplash.com/photo-1609592424109-dd7736464585?w=500',
                images: [],
                basePrice: 650000,
                stock: 80,
                specs: {
                    'Dung lượng': '20000 mAh',
                    'Công suất sạc': '18W',
                    'Cổng sạc': 'Micro-USB, USB-C, USB-A'
                },
                variants: []
            }
        ];

        for (const prod of productsData) {
            await Product.create(prod);
        }
        console.log('✅ Đã tạo danh sách sản phẩm mẫu thành công.');

        // 6. Tạo Vouchers mẫu
        console.log('📝 Đang tạo các mã giảm giá (vouchers)...');
        await Voucher.create([
            { code: 'TECHMARKET50', discountType: 'fixed', discountValue: 50000, minOrderValue: 200000, usageLimit: 100, usedCount: 0 },
            { code: 'GIAM10', discountType: 'percent', discountValue: 10, minOrderValue: 500000, maxDiscount: 100050, usageLimit: 50, usedCount: 0 },
            { code: 'VIP200', discountType: 'fixed', discountValue: 200000, minOrderValue: 2000000, usageLimit: 10, usedCount: 0 }
        ]);
        console.log('✅ Đã tạo các mã giảm giá thành công.');

        // 7. Tạo Flash Sale mẫu
        console.log('📝 Đang tạo chương trình Flash Sale mẫu...');
        const phone = await Product.findOne({ slug: 'iphone-15-pro-max' });
        const watch = await Product.findOne({ slug: 'samsung-galaxy-watch-6-lte-44mm' });

        if (phone && watch) {
            const startTime = new Date(); // Bắt đầu ngay bây giờ
            const endTime = new Date();
            endTime.setHours(endTime.getHours() + 12); // Kéo dài 12 giờ

            await FlashSale.create({
                name: 'Flash Sale Hè Siêu Rẻ 2026',
                startTime,
                endTime,
                status: 'active',
                products: [
                    { productId: phone._id, promoPrice: 25000000, soldQuantity: 2, maxQuantity: 10 },
                    { productId: watch._id, promoPrice: 5000000, soldQuantity: 5, maxQuantity: 20 }
                ]
            });
            console.log('✅ Đã tạo Flash Sale thành công.');
        }

        console.log('🎉 Seed dữ liệu mẫu hoàn thành xuất sắc!');
    } catch (error) {
        console.error('❌ Đã xảy ra lỗi trong quá trình seed dữ liệu:', error);
    } finally {
        console.log('🔌 Đang ngắt kết nối cơ sở dữ liệu an toàn...');
        await mongoose.connection.close();
        console.log('✅ Đã ngắt kết nối thành công. Terminal sẵn sàng!');
    }
};

seedData();
