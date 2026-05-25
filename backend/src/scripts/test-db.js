const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const testDatabase = async () => {
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

    // 1. Xóa dữ liệu cũ (Clean up)
    console.log('🧹 Đang dọn dẹp dữ liệu cũ của collection users và categories...');
    const deleteUsersResult = await User.deleteMany({});
    const deleteCategoriesResult = await Category.deleteMany({});
    console.log(`   - Đã xóa ${deleteUsersResult.deletedCount} tài khoản cũ.`);
    console.log(`   - Đã xóa ${deleteCategoriesResult.deletedCount} danh mục cũ.`);

    // 2. Ghi thử dữ liệu (Insert)
    console.log('📝 Đang ghi thử dữ liệu mẫu...');
    
    // Tạo tài khoản Admin mẫu
    const dummyHashedPassword = '$2b$10$dummyhashedpasswordformatfortestingpurpose';
    const adminUser = await User.create({
      fullName: 'TechMarket Admin Mẫu',
      email: 'admin_test@techmarket.com',
      password: dummyHashedPassword,
      role: 'admin',
      phone: '0987654321',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
      isActive: true,
      loyaltyPoints: 100,
    });
    console.log('   - Đã tạo thành công tài khoản Admin mẫu.');

    // Tạo danh mục mẫu
    const laptopCategory = await Category.create({
      name: 'Laptop',
      slug: 'laptop',
      image: 'https://images.unsplash.com/photo-1496181130204-755241544e35',
    });
    console.log('   - Đã tạo thành công danh mục "Laptop".');

    // 3. Đọc dữ liệu (Query)
    console.log('🔍 Đang kiểm tra đọc dữ liệu vừa ghi từ Database...');
    const queryAdmin = await User.findOne({ email: 'admin_test@techmarket.com' });
    const queryCategory = await Category.findOne({ slug: 'laptop' });

    console.log('\n=============================================');
    console.log('📊 THÔNG TIN TÀI KHOẢN ADMIN TRONG DB:');
    console.log(JSON.stringify(queryAdmin, null, 2));
    console.log('=============================================');

    console.log('\n=============================================');
    console.log('📊 THÔNG TIN DANH MỤC TRONG DB:');
    console.log(JSON.stringify(queryCategory, null, 2));
    console.log('=============================================\n');

    console.log('🎉 Quá trình ghi và đọc thử dữ liệu đã diễn ra thành công tốt đẹp!');
  } catch (error) {
    console.error('❌ Đã xảy ra lỗi trong quá trình kiểm tra Database:', error);
  } finally {
    console.log('🔌 Đang ngắt kết nối cơ sở dữ liệu an toàn...');
    await mongoose.connection.close();
    console.log('✅ Đã ngắt kết nối thành công. Terminal sẵn sàng!');
  }
};

testDatabase();
