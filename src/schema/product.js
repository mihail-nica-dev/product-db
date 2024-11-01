const { z, Image } = require('../utils');
const { Metadata } = require('./metadata');
const mongoose = require('mongoose');
const { zodSchema } = require('@zodyac/zod-mongoose');
const md5 = require('md5');
const { Source } = require('./source');
class Product {
    __source;
    __title;
    __url;
    __prices;
    __metadata = [];

    constructor(initialValues = {}) {
        this.__id = initialValues.id || md5(initialValues.url);
        this.__source = initialValues.source ? new Source(initialValues.source) : new Source();
        this.__title = initialValues.title || '';
        this.__url = initialValues.url || '';
        this.__prices = initialValues.prices || [];
        this.__metadata = initialValues.metadata || [];
    }

    //#region getters

    get id() {
        return this.__id;
    }

    get title() {
        return this.__title;
    }


    get url() {
        return this.__url;
    }

    get prices() {
        return this.__prices;
    }


    get description() {
        return this.__metadata.find(v => v.type === 'description')?.value;
    }

    get ingredients() {
        return this.__metadata.find(v => v.type === 'ingredients')?.value;
    }

    get allergens() {
        return this.__metadata.find(v => v.type === 'allergens')?.value;
    }

    get images() {
        return this.__metadata.filter(v => v.type === 'image').map(v => v.value);
    }

    get metadata() {
        return this.__metadata;
    }
    //#endregion

    //#region setters
    set title(title) {
        this.__title = title;
    }

    set url(url) {
        this.__url = url;
    }

    set price(price) {
        this.__price = price;
    }

    addMetadata(metadata) {
        this.__metadata.push(metadata);
    }
    //#endregion

    //#region methods
    async toJSON() {
        return {
            id: this.__id,
            source: this.__source ? await this.__source.toJSON() : undefined,
            title: this.__title,
            url: this.__url,
            prices: this.__prices,
            metadata: this.__metadata ? await Promise.all(this.__metadata.map(async (v) => await v.toJSON())) : undefined
        };
    }

    static toZod() {
        return z.object({
            id: z.string().optional(),
            source: Source.toZod().optional(),
            title: z.string().optional(),
            url: z.string().optional(),
            prices: z.array(z.object({
                currency: z.string(),
                price: z.number(),
            })).optional(),
            metadata: z.array(Metadata.toZod()).optional()
        });
    }

    static mongoose() {
        const schema = zodSchema(Product.toZod());
        const model = mongoose.models?.['Product'] || mongoose.model('Product', schema);
        return model;
    }

    async save() {
        const model = Product.mongoose();
        return await model.findOneAndUpdate({ 
            'id': this.__id,
            'source.id': this.__source.id,
        }, await this.toJSON(), { upsert: true });
    }
    //#endregion methods
}

module.exports = {
    Product
};