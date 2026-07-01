const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

// Get host URL from request to build full image links dynamically
const getFullUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/images/uploads/${filename}`;
};

// Route for single image upload
router.post('/single', authenticate, authorizeRoles('admin', 'staff'), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn một file ảnh để upload'
            });
        }
        
        const url = getFullUrl(req, req.file.filename);
        return res.status(200).json({
            success: true,
            message: 'Upload ảnh thành công',
            url: url
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Route for multiple images upload
router.post('/multiple', authenticate, authorizeRoles('admin', 'staff'), upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn các file ảnh để upload'
            });
        }
        
        const urls = req.files.map(file => getFullUrl(req, file.filename));
        return res.status(200).json({
            success: true,
            message: 'Upload nhiều ảnh thành công',
            urls: urls
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
