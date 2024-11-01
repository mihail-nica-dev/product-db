const { z, Image } = require('../utils');
const { Metadata } = require('./metadata');
const mongoose = require('mongoose');
const { zodSchema } = require('@zodyac/zod-mongoose');

class Product {
    __source;
    __title;
    __description;
    __url;
    __price;
    __images;
    __metadata;

    constructor({
        source,
        title,
        description,
        url,
        price,
        images,
        metadata,
    }) {
        this.__source = source;
        this.__title = title;
        this.__description = description;
        this.__url = url;
        this.__price = price;
        this.__images = images;
        this.__metadata = metadata;
    }

    //#region getters
    get title() {
        return this.__title;
    }

    get description() {
        return this.__description;
    }

    get url() {
        return this.__url;
    }

    get price() {
        return this.__price;
    }

    get images() {
        return this.__images;
    }

    get metadata() {
        return this.__metadata;
    }
    //#endregion

    //#region setters
    set title(title) {
        this.__title = title;
    }

    set description(description) {
        this.__description = description;
    }

    set url(url) {
        this.__url = url;
    }

    set price(price) {
        this.__price = price;
    }

    set images(images) {
        this.__images = images;
    }

    set metadata(metadata) {
        this.__metadata = metadata;
    }
    //#endregion

    //#region methods
    async toJSON() {
        return {
            title: this.__title,
            description: this.__description,
            url: this.__url,
            price: this.__price,
            images: await Promise.all(this.__images.map(async (image) => await new Image(image).toJSON())),
            metadata: this.__metadata
        };
    }

    async toZod() {
        return z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            url: z.string().optional(),
            price: z.number().optional(),
            images: z.array(await new Image().toZod()),
            metadata: z.array(await new Metadata().toZod()).optional()
        });
    }

    async mongoose() {
        const schema = zodSchema(await this.toZod());
        const model = mongoose.models?.['Product'] || mongoose.model('Product', schema);
    }

    async save() {
        const model = await this.mongoose();
        await Promise.all(this.__images.map(async (image) => await new Image({url: image}).save()));
        return await model.findOneAndUpdate({ 
            'source.id': this.__source.id,
            'source.source': this.__source.source
        }, await this.toJSON(), { upsert: true, new: true });
    }
    //#endregion methods
}

module.exports = {
    Product
};