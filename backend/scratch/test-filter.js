const mongoose = require('mongoose');
const productService = require('../src/services/productService');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Test category filter
    const res1 = await productService.getProducts({ category: 'dien-thoai' });
    console.log('Category filter count:', res1.products.length, 'Total:', res1.pagination.total);
    if (res1.products.length > 0) {
        console.log('Sample category in products:', res1.products[0].categoryId);
    }
    
    // Test brand filter
    const res2 = await productService.getProducts({ brand: 'apple' });
    console.log('Brand filter count:', res2.products.length, 'Total:', res2.pagination.total);
    if (res2.products.length > 0) {
        console.log('Sample brand in products:', res2.products[0].brandId);
    }

    // Test both
    const res3 = await productService.getProducts({ category: 'dien-thoai', brand: 'apple' });
    console.log('Combined filter count:', res3.products.length, 'Total:', res3.pagination.total);

    await mongoose.disconnect();
}
main();
