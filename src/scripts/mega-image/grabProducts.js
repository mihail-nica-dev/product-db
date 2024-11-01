const cheerio = require('cheerio');
const { Product } = require('../../schema/product');
const { Image } = require('../../utils');
const md5 = require('md5');

/**
 * @typedef {Object} Product
 * @property {string} img - The image source URL of the product.
 * @property {string} mega_url - The URL of the product.
 * @property {string} name - The name of the product.
 * @property {string} brand - The brand of the product.
 * @property {string} priceDigits - The price digits of the product.
 * @property {string} priceInt - The integer part of the price.
 * @property {string} unit - The unit of the product.
 * @property {number} pricePerUnit - The price per unit of the product.
 */

/**
 * Extracts product information from the page.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @returns {Promise<Product[]>} An array of product objects.
 */
const spyderGrabProducts = async (source, breadcrumbs, url, context) => {
    const steps = breadcrumbs.length;
    const grab = async (i) => {
        const page = await context.newPage();
        await page.goto(`${url}/${breadcrumbs.slice(0, i).join('/')}`);
        const products = await grabProducts(page,source, true, context);
        await page.close();
        return products;
    }
    const products = [];
    for (const i of Array(steps).keys()) {
       const products = await grab(i);  
       products.forEach(product => products.push(product));
    }
    return products;
}
const grabProducts = async (page,source, isSpyder = false, context) => {
    const productBlocks = await page.$$('[data-testid="product-block"]');
    const products = [];
    for (const productBlock of productBlocks) {
        try {
            const html = await productBlock.innerHTML();
            const $ = cheerio.load(html);
            const url = $('a').attr('href')?.trim();
            if(!url) continue;
            const parts = url.split('/');
            const possiblePaths = parts.filter(part => ![':', '?', '#'].includes(part)).slice(0, -2).filter(part => part !== '');
            if(!isSpyder) {
                const products = await spyderGrabProducts(source, possiblePaths, 'https://mega-image.ro', context);
                products.forEach(product => products.push(product));
            }
            const mega_url = possiblePaths.join('/');
            const img = new Image({url: $('img').attr('src')?.trim()});
            await img.save();
            const idbase = parts.filter(part => ![':', '?', '#'].includes(part));
            const id = md5(idbase.join('/'));
            const productPayload = {
                source_id: id,
                source: await source.toJSON(),
                images: [await img.toJSON()],
                breadcrumbs: possiblePaths,
                prices: [
                    {
                        price: `${+$('[data-testid="product-block-price"] div').filter((_, el) => !isNaN($(el).text())).first().text()?.trim()}.${+$('[data-testid="product-block-price"] sup').text()?.trim()}`,
                        currency: 'RON',
                    }
                ],
                name: $('[data-testid="product-name"]').text()?.trim(),
                brand: $('[data-testid="product-brand"]').text()?.trim(),
                unit: $('[data-testid="product-block-price-per-unit"]').text()?.split('/').pop()?.trim(),
            }
            console.log(productPayload);
        } catch (err) {
            console.error(err);
        }
    }
    const result = products.filter(product => product.mega_url);
    console.table(result);
    return result;
};

module.exports = { grabProducts };