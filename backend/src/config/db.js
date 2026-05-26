const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGO_URI chưa được định nghĩa trong file .env');
    process.exit(1);
  }

  const options = {
    dbName: process.env.DB_NAME || 'techmarket_db',
    autoIndex: true, // Tự động tạo index từ schema (hữu ích cho môi trường phát triển, prod nên tắt)
  };

  try {
    mongoose.connection.on('connecting', () => {
      console.log('🔄 Đang kết nối tới MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB đã kết nối thành công.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Lỗi kết nối MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mất kết nối tới MongoDB. Đang thử kết nối lại...');
    });

    await mongoose.connect(mongoUri, options);
  } catch (error) {
    console.error('❌ Kết nối MongoDB thất bại:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
