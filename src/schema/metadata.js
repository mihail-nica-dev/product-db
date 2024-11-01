const { z, Image } = require('../utils');

class Metadata {
    __title;
    __type;
    __description;
    __key;
    __value;

    constructor(initialValues = {}) {
        this.__title = initialValues.title || '';
        this.__type = initialValues.type || '';
        this.__description = initialValues.description || '';
        this.__key = initialValues.key || '';
        this.__value = initialValues.value || '';
    }

    //#region getters
    get type() {
        return this.__type;
    }

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
    set type(type) {
        this.__type = type;
    }

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
            type: this.__type,
            description: this.__description,
            key: this.__key,
            value: this.__value
        };
    }

    static toZod() {
        return z.object({
            title: z.string().optional(),
            type: z.string().optional(),
            description: z.string().optional(),
            key: z.string().optional(),
            value: z.any().optional()
        }).optional();
    }
    //#endregion methods
}

module.exports = {
    Metadata
};