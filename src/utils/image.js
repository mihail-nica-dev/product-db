const { fs, path } = require('./files');

class Image {
    __url;
    __name;
    __dirPath = path.resolve(__dirname, '..', '..', 'images');
    constructor({
        url,
        name
    }) {
        this.__url = url;
        this.__name = name;
        if(!fs.existsSync(this.__dirPath)) fs.mkdirSync(this.__dirPath, { recursive: true });
    }

    get name() {
        return this.__name ?? this.__url?.split('/').pop()?.split('?')?.[0]?.replace(/\//g, '_');
    }

    get filePath() {
        return path.resolve(this.__dirPath, this.name);
    }

    get url() {
        return this.__url;
    }

    get buffer() {
        return fs.readFileSync(this.filePath);
    }


    async load() {
        if(fs.existsSync(this.filePath)) return this.buffer;
        const response = await fetch(this.__url);
        fs.writeFileSync(this.filePath, Buffer.from(await response.arrayBuffer()));
        return this.buffer;
    }

    async toJSON() {
        return {
            url: this.url,
            name: this.name,
            filePath: this.filePath
        };
    }

    async toZod() {
        return z.object({
            url: z.string().optional(),
            name: z.string().optional(),
            filePath: z.string().optional()
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