# TechMarket Ecommerce Backend

Backend API cho hệ thống thương mại điện tử TechMarket, xây dựng bằng Node.js, Express và MongoDB.

## Giới thiệu nhanh

Dự án này cung cấp các API cho:

- Xác thực người dùng
- Quản lý người dùng
- Danh mục, thương hiệu, sản phẩm
- Giỏ hàng
- Đơn hàng
- Đánh giá sản phẩm
- Voucher
- Wishlist
- Flash sale
- Khu vực admin

## Công nghệ sử dụng

- Node.js
- Express
- MongoDB, Mongoose
- JWT Authentication
- Joi validation
- CORS
- Helmet
- Morgan

## Yêu cầu môi trường

- Node.js
- MongoDB
- npm

## Cài đặt

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` ở thư mục gốc với các biến sau:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/techmarket_db
DB_NAME=techmarket_db
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

## Chạy dự án

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## Scripts có sẵn

- `npm run dev`: chạy server bằng nodemon
- `npm start`: chạy server bằng node
- `npm run seed`: seed dữ liệu mẫu
- `npm run test:db`: kiểm tra kết nối database

## Cấu trúc thư mục

```text
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  validations/
  scripts/
```

## Luồng kiến trúc

Project đang đi theo mô hình:

- `route` nhận request
- `middleware` xử lý auth / validation / role
- `controller` nhận dữ liệu từ request và trả response
- `service` xử lý business logic
- `model` làm việc với MongoDB

## API chính

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh-token`

### User

- `GET /api/v1/users/me`

### Categories

- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `DELETE /api/v1/categories/:id`

### Brands

- `GET /api/v1/brands`
- `POST /api/v1/brands`
- `DELETE /api/v1/brands/:id`

### Products

- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

### Cart

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:itemId`
- `DELETE /api/v1/cart/items/:itemId`
- `DELETE /api/v1/cart`

### Orders

- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/cancel`
- `PATCH /api/v1/orders/:id/status`

### Reviews

- `POST /api/v1/reviews`
- `GET /api/v1/reviews/product/:productId`
- `DELETE /api/v1/reviews/:id`

### Vouchers

- `GET /api/v1/vouchers`
- `POST /api/v1/vouchers/validate`
- `POST /api/v1/vouchers`
- `DELETE /api/v1/vouchers/:id`

### Wishlist

- `GET /api/v1/wishlist`
- `POST /api/v1/wishlist/toggle`

### Flash sales

- `GET /api/v1/flash-sales/active`
- `POST /api/v1/flash-sales`
- `GET /api/v1/flash-sales`
- `DELETE /api/v1/flash-sales/:id`

### Admin

- `GET /api/v1/admin/...`

## Ghi chú về xác thực

Các API cần đăng nhập sẽ dùng header:

```http
Authorization: Bearer <access_token>
```

## Ghi chú về validation

Project dùng Joi để validate request ở tầng route trước khi vào controller/service.  
Nếu request sai format, API sẽ trả lỗi 400 sớm để tránh dữ liệu bẩn.

## Lưu ý khi phát triển tiếp

- Nên giữ response theo format thống nhất
- Route nào thay đổi dữ liệu nên có validation
- Các thao tác admin nên được bảo vệ bằng role middleware
- Soft delete đang được dùng ở một số model, cần kiểm tra nhất quán khi thêm tính năng mới

## Tác giả

Project nội bộ cho TechMarket Ecommerce System.
