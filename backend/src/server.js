require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kết nối Database trước khi start server
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📡 Môi trường hoạt động: ${process.env.NODE_ENV || 'development'}`);
    });

    // Xử lý unhandled promise rejections để tránh crash server đột ngột
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Đang tắt server gracefully...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Xử lý SIGTERM từ hệ thống (khi deploy)
    process.on('SIGTERM', () => {
      console.log('👋 Nhận tín hiệu SIGTERM. Đang tắt server gracefully...');
      server.close(() => {
        console.log('💥 Đã ngắt toàn bộ kết nối.');
      });
    });

  } catch (error) {
    console.error('❌ Lỗi nghiêm trọng khi khởi động Server:', error.message);
    process.exit(1);
  }
};

startServer();
