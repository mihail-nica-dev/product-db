const { z, Image } = require('../utils');

class Metadata {
    __title;
    __description;
    __key;
    __value;

    constructor({
        title,
        description,
        key,
        value,
    }) {
        this.__title = title;
        this.__description = description;
        this.__key = key;
        this.__value = value;
    }

    //#region getters
    get title() {
        return this.__title;
    }

    get description() {
        return this.__description;
    }

    get key() {
        return this.__key;
    }

    get value() {
        return this.__value;
    }
    //#endregion

    //#region setters
    set title(title) {
        this.__title = title;
    }

    set description(description) {
        this.__description = description;
    }

    set key(key) {
        this.__key = key;
    }

    set value(value) {
        this.__value = value;
    }
    //#endregion

    //#region methods
    async toJSON() {
        return {
            title: this.__title,
            description: this.__description,
            key: this.__key,
            value: this.__value
        };
    }

    async toZod() {
        return z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            key: z.string().optional(),
            value: z.string().optional()
        });
    }
    //#endregion methods
}

module.exports = {
    Metadata
};