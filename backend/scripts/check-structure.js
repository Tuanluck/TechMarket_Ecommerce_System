const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve(__dirname, '..');

const REQUIRED_DIRS = [
  'src/config',
  'src/models',
  'src/routes',
  'src/controllers',
  'src/services',
  'src/middlewares',
  'src/validations',
  'src/utils',
];

const REQUIRED_FILES = [
  'src/app.js',
  'src/server.js',
  'src/config/db.js',
  '.env',
];

const EXPECTED_MODELS = [
  'User.js',
  'Category.js',
  'Brand.js',
  'Product.js',
  'Cart.js',
  'Order.js',
  'OrderItem.js',
  'FlashSale.js',
  'Voucher.js',
  'Review.js',
  'Wishlist.js',
  'PaymentWebhookRaw.js',
];

console.log('🔍 BẮT ĐẦU KIỂM TRA CẤU TRÚC FOLDER BACKEND (LAYERED ARCHITECTURE) 🔍\n');

let passCount = 0;
let totalChecks = 0;
const issues = [];

// 1. Kiểm tra thư mục
console.log('📁 --- KIỂM TRA THƯ MỤC CỐT LÕI ---');
REQUIRED_DIRS.forEach((dir) => {
  totalChecks++;
  const fullPath = path.join(BACKEND_DIR, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${dir.padEnd(20)} [TỒN TẠI]`);
    passCount++;
  } else {
    console.log(`  ❌ ${dir.padEnd(20)} [THIẾU]`);
    issues.push(`Thiếu thư mục quan trọng: ${dir}/`);
  }
});

// 2. Kiểm tra file cấu hình và ứng dụng chính
console.log('\n📄 --- KIỂM TRA FILE CẤU HÌNH & ENTRYPOINTS ---');
REQUIRED_FILES.forEach((file) => {
  totalChecks++;
  const fullPath = path.join(BACKEND_DIR, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file.padEnd(20)} [TỒN TẠI]`);
    passCount++;
  } else {
    console.log(`  ❌ ${file.padEnd(20)} [THIẾU]`);
    issues.push(`Thiếu file cấu hình bắt buộc: ${file}`);
  }
});

// 3. Kiểm tra các Mongoose Models
console.log('\n💾 --- KIỂM TRA CÁC DATABASE MODELS ---');
const modelsDir = path.join(BACKEND_DIR, 'src/models');
if (fs.existsSync(modelsDir)) {
  EXPECTED_MODELS.forEach((model) => {
    totalChecks++;
    const fullPath = path.join(modelsDir, model);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ Models/${model.padEnd(20)} [ĐÃ THIẾT LẬP]`);
      passCount++;
    } else {
      console.log(`  ❌ Models/${model.padEnd(20)} [THIẾU]`);
      issues.push(`Thiếu database model: src/models/${model}`);
    }
  });
} else {
  totalChecks += EXPECTED_MODELS.length;
  console.log('  ❌ Thư mục models không tồn tại, bỏ qua kiểm tra chi tiết các model.');
  issues.push('Thư mục src/models/ không tồn tại.');
}

// 4. In kết quả tổng quan
const completionRate = Math.round((passCount / totalChecks) * 100);
console.log('\n=============================================');
console.log(`📊 KẾT QUẢ ĐÁNH GIÁ CẤU TRÚC DỰ ÁN: ${completionRate}% HOÀN THÀNH`);
console.log(`   - Tổng số hạng mục kiểm tra: ${totalChecks}`);
console.log(`   - Hạng mục đạt yêu cầu: ${passCount}`);
console.log(`   - Hạng mục bị thiếu sót: ${totalChecks - passCount}`);
console.log('=============================================');

if (issues.length > 0) {
  console.log('\n⚠️  DANH SÁCH CÁC HẠNG MỤC CẦN KHẮC PHỤC / BỔ SUNG:');
  issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
  console.log('\n💡 Gợi ý: Hãy tạo các thư mục bị thiếu bằng lệnh mkdir hoặc tạo file tương ứng.');
} else {
  console.log('\n🎉 Tuyệt vời! Cấu trúc thư mục Backend của bạn đã hoàn toàn chuẩn hóa Layered Architecture!');
}
