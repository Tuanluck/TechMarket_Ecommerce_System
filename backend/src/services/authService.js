const User = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/Token");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30m",
    },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};

const registerService = async (userData) => {
  const { fullName, email, password, phone } = userData;

  // Kiểm tra xem user có tồn tại không
  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    const error = new Error("Email đã tồn tại");
    error.status = 409;
    throw error;
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo User
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
  });

  // Trả về thông tin an toàn (loại bỏ password ra khỏi object trả về)
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    loyaltyPoints: user.loyaltyPoints,
    createdAt: user.createdAt,
  };
};

const loginService = async (userData) => {
  const { email, password } = userData;

  // Kiểm tra xem user có tồn tại không
  const isUserExists = await User.findOne({ email });
  if (!isUserExists) {
    const error = new Error("Email không tồn tại");
    error.status = 404;
    throw error;
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, isUserExists.password);
  if (!isPasswordValid) {
    const error = new Error("Mật khẩu không chính xác");
    error.status = 401;
    throw error;
  }

  // Tạo Access Token
  const accessToken = generateAccessToken(isUserExists);

  // Tạo Refresh Token
  const refreshToken = generateRefreshToken(isUserExists);

  // Lưu Refresh Token vào database
  await RefreshToken.create({
    user_id: isUserExists._id,
    token: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Trả về thông tin an toàn (loại bỏ password ra khỏi object trả về)
  return {
    _id: isUserExists._id,
    fullName: isUserExists.fullName,
    email: isUserExists.email,
    role: isUserExists.role,
    phone: isUserExists.phone,
    loyaltyPoints: isUserExists.loyaltyPoints,
    createdAt: isUserExists.createdAt,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw { status: 401, message: "Không tìm thấy Refresh Token" };
  }

  const hashedToken = hashToken(oldRefreshToken);
  const storedToken = await RefreshToken.findOneAndDelete({
    token: hashedToken,
  });

  if (!storedToken) {
    throw { status: 403, message: "Token không hợp lệ hoặc đã hết hạn" };
  }

  try {
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();

    await storedToken.deleteOne();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await RefreshToken.create({
      user_id: user._id,
      token: hashToken(newRefreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  } catch (err) {
    throw { status: 403, message: "Phiên đăng nhập hết hạn" };
  }
};
const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw { status: 400, message: "Refresh Token là bắt buộc" };
  }

  const hashedToken = hashToken(refreshToken);

  const deletedToken = await RefreshToken.deleteOne({
    token: hashedToken,
  });

  if (!deletedToken.deletedCount) {
    throw { status: 404, message: "Refresh Token không tồn tại" };
  }

  return {
    message: "Đăng xuất thành công",
  };
};

module.exports = {
  registerService,
  loginService,
  refreshToken,
  logoutService,
};
