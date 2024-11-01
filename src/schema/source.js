const { z, Image } = require('../utils');

class Source {
    __title;
    __description;
    __url;
    __image;

    constructor({
        title,
        description,
        url,
        image,
    }) {
        this.__title = title;
        this.__description = description;
        this.__url = url;
        this.__image = image;
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
            title: this.__title,
            description: this.__description,
            url: this.__url,
            image: await new Image({url: this.__image}).toJSON()
        };
    }

    async toZod() {
        return z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            url: z.string().optional(),
            image: await new Image().toZod()
        });
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