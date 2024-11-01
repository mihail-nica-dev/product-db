const { fs, path } = require('./files');
const z = require('zod');

class Image {
    __url;
    __name;
    __dirPath = path.resolve(__dirname, '..', '..', 'images');
    constructor(initialValues = {}) {
        this.__url = initialValues.url || '';
        this.__name = initialValues.name || this.name;
        if(!fs.existsSync(this.__dirPath)) fs.mkdirSync(this.__dirPath, { recursive: true });
    }

    get name() {
        return this.__name ?? (typeof this.__url === 'string' ? this.__url.split('/').pop()?.split('?')?.[0]?.replace(/\//g, '_') : Math.random().toString(36).substring(2, 15)+".jpg");
    }

    get filePath() {
        return path.resolve(this.__dirPath, this.name);
    }

    get url() {
        return this.__url;
    }

    get buffer() {
        if(!this.__url) return;
        if(!['http://', 'https://'].some(v => this.__url.startsWith(v))) return;
        return fs.readFileSync(this.filePath);
    }


    async load() {
        if(!this.__url) return;
        if(!['http://', 'https://'].some(v => this.__url.startsWith(v))) return;
        if(fs.existsSync(this.filePath)) return this.buffer;
        const response = await fetch(this.__url);
        fs.writeFileSync(this.filePath, Buffer.from(await response.arrayBuffer()));
        return this.buffer;
    }

    async toJSON() {
        return {
            url: `https://mihail-nica-dev.github.io/product-db/images/${this.name}`,
            name: this.name,
        };
    }

    static toZod() {
        return z.object({
            url: z.string().optional(),
            name: z.string().optional(),
        });
    }

    async save() {
        await Promise.all([
            this.load(),
        ]);
    }
}

module.exports = {
    Image
};