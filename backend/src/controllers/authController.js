const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const data = await authService.registerService(req.body);

        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công",
            data,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const data = await authService.loginService(req.body);

        return res.status(200).json({
            success: true,
            message: "Đăng nhập tài khoản thành công",
            data,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message,
        });
    }
};
const logout = async (req, res) => {
    try {
        const data = await authService.logoutService(req.body.refreshToken);
        return res.status(200).json({
            success: true,
            message: "Đăng xuất tài khoản thành công",
            data,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message,
        });
    }
};


module.exports = {
    register,
    login,
    logout
}