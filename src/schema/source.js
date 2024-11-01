const { z, Image } = require('../utils');
const md5 = require('md5');

class Source {
    __title;
    __description;
    __url;
    __image;

    constructor(initialValues = {}) {
        this.__title = initialValues.title || '';
        this.__description = initialValues.description || '';
        this.__url = initialValues.url || '';
        this.__image = initialValues.image || '';
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

    get image() {
        return this.__image;
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

    set image(image) {
        this.__image = image;
    }
    //#endregion

    //#region methods
    async toJSON() {
        return {
            id: md5(this.__url),
            title: this.__title,
            description: this.__description,
            url: this.__url,
            image: await new Image({url: this.__image}).toJSON()
        };
    }

    static toZod() {
        return z.object({
            id: z.string().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            url: z.string().optional(),
            image: Image.toZod()
        }).optional();
    }

    async save() {
        await Promise.all([
            new Image({url: this.__image}).save(),
        ]);
    }
    //#endregion methods
}

module.exports = {
    Source
};