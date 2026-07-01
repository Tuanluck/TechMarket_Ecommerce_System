const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const getProducts = async (queryParams) => {
    let {
        page = 1,
        limit = 12,
        category,
        brand,
        categoryId,
        brandId,
        minPrice,
        maxPrice,
        sort,
        q
    } = queryParams;

    // Convert types
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 12;
    if (limit > 50) limit = 50;

    const filter = {};

    // Filter by category (ID or Slug)
    if (categoryId) {
        filter.categoryId = categoryId;
    } else if (category) {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
            filter.categoryId = cat._id;
        } else {
            // Category slug doesn't exist, return no results
            filter.categoryId = new mongoose.Types.ObjectId();
        }
    }

    // Filter by brand (ID or Slug)
    if (brandId) {
        filter.brandId = brandId;
    } else if (brand) {
        const br = await Brand.findOne({ slug: brand });
        if (br) {
            filter.brandId = br._id;
        } else {
            // Brand slug doesn't exist, return no results
            filter.brandId = new mongoose.Types.ObjectId();
        }
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.basePrice = {};
        if (minPrice !== undefined && minPrice !== '') {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) filter.basePrice.$gte = min;
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) filter.basePrice.$lte = max;
        }
        // If empty criteria, clean up
        if (Object.keys(filter.basePrice).length === 0) {
            delete filter.basePrice;
        }
    }

    // Search query
    if (q) {
        filter.name = { $regex: q, $options: 'i' };
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // Default: newest
    if (sort === 'price_asc') {
        sortObj = { basePrice: 1 };
    } else if (sort === 'price_desc') {
        sortObj = { basePrice: -1 };
    } else if (sort === 'rating') {
        sortObj = { ratingAvg: -1 };
    } else if (sort === 'newest') {
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug image')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('name slug thumbnail basePrice stock ratingAvg categoryId brandId');

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages
        }
    };
};

const getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug })
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug image');

    if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    return product;
};

const createProduct = async (productData) => {
    const { slug, categoryId, brandId } = productData;

    // Check unique slug
    const existing = await Product.findOne({ slug });
    if (existing) {
        const error = new Error("Slug sản phẩm đã tồn tại");
        error.status = 400;
        error.code = "DUPLICATE_SLUG";
        throw error;
    }

    // Check categoryId exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        const error = new Error("Danh mục không tồn tại");
        error.status = 400;
        error.code = "INVALID_CATEGORY";
        throw error;
    }

    // Check brandId exists
    const brandExists = await Brand.findById(brandId);
    if (!brandExists) {
        const error = new Error("Thương hiệu không tồn tại");
        error.status = 400;
        error.code = "INVALID_BRAND";
        throw error;
    }

    return await Product.create(productData);
};

const updateProduct = async (id, updateData) => {
    const { slug, categoryId, brandId } = updateData;

    // Check if product exists first
    const product = await Product.findById(id);
    if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    // Check slug duplicate if modified
    if (slug && slug !== product.slug) {
        const existing = await Product.findOne({ slug });
        if (existing) {
            const error = new Error("Slug sản phẩm đã tồn tại");
            error.status = 400;
            error.code = "DUPLICATE_SLUG";
            throw error;
        }
    }

    // Check category exists if modified
    if (categoryId) {
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            const error = new Error("Danh mục không tồn tại");
            error.status = 400;
            error.code = "INVALID_CATEGORY";
            throw error;
        }
    }

    // Check brand exists if modified
    if (brandId) {
        const brandExists = await Brand.findById(brandId);
        if (!brandExists) {
            const error = new Error("Thương hiệu không tồn tại");
            error.status = 400;
            error.code = "INVALID_BRAND";
            throw error;
        }
    }

    return await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        const error = new Error("Sản phẩm không tồn tại");
        error.status = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
    }

    product.isDeleted = true;
    await product.save();
    return product;
};

module.exports = {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
};
