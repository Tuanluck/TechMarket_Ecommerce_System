const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({}).populate('categoryId');
    const result = {};
    for (const p of products) {
        const catName = p.categoryId?.name || 'Unknown';
        if (!result[catName]) result[catName] = [];
        result[catName].push({
            name: p.name,
            slug: p.slug,
            thumbnail: p.thumbnail,
            images: p.images
        });
    }
    console.log(JSON.stringify(result, null, 2));
    await mongoose.disconnect();
}
main();
