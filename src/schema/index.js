require('dotenv').config();
const { connect } = require('mongoose');
const { Product } = require('./product');
const { Metadata } = require('./metadata');
const { Source } = require('./source');
const { events } = require('../utils/events');
connect(process.env.MONGO_URI).then(() => {
    events.emit('ready:mongo');
});
module.exports = {
    Product,
    Metadata,
    Source
};