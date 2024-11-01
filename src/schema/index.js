require('dotenv').config();
const { connect } = require('mongoose');
const { Product } = require('./product');
const { Metadata } = require('./metadata');
const { Source } = require('./source');
connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'));
module.exports = {
    Product,
    Metadata,
    Source
};