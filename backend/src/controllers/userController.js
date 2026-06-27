const User = require('../models/User');

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -__v');
        if (!user) {
            const error = new Error("Người dùng không tồn tại");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin cá nhân thành công",
            data: user
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            error_code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message
        });
    }
};

module.exports = {
    getMe
};
