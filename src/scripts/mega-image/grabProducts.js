const cheerio = require('cheerio');
const { Product } = require('../../schema/product');
const { Image } = require('../../utils');
const md5 = require('md5');
const { scrollPage } = require('../../utils/browser');
const { normalize } = require('../../utils/text');

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
    console.log(`   SPYDER: ${steps} steps`);
    const grab = async (i) => {
        const page = await context.newPage();
        const _url = `${url}/${breadcrumbs.slice(0, i).join('/')}`;
        console.log(`   SPYDER: ${_url}`);
        await page.goto(_url);
        await scrollPage(page, 'up');
        await wait(1000);
        await scrollPage(page, 'down');
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
    console.log(`   ${productBlocks.length} products found`);
    for (const productBlock of productBlocks) {
        console.log(`   ${productBlocks.indexOf(productBlock)}/${productBlocks.length}`);
        try {
            const html = await productBlock.innerHTML();
            const $ = cheerio.load(html);
            const url = $('a').attr('href')?.trim();
            if(!url) continue;
            const parts = url.split('/');
            const possiblePaths = parts.filter(part => ![':', '?', '#'].includes(part)).slice(0, -2).filter(part => part !== '');
            // if(!isSpyder) {
            //     const products = await spyderGrabProducts(source, possiblePaths, 'https://mega-image.ro', context);
            //     products.forEach(product => products.push(product));
            //     console.log(`  Loaded ${products.length} products`);
            // }
            const img = new Image({url: $('img').attr('src')?.trim()});
            await img.save();
            const id = md5(url);
            const productPayload = {
                id,
                source: await source.toJSON(),
                title: $('[data-testid="product-name"]').text()?.trim(),
                images: [await img.toJSON()],
                product_url: url,
                breadcrumbs: possiblePaths.filter((v,i,s) => s.findIndex(v2 => v2 === v) === i).filter(v => normalize(v) !== normalize($('[data-testid="product-name"]').text()?.trim())).map(v => v.split('-').map(v => v.trim()).join(' ')),
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
            products.push(productPayload);
            console.log(`  Loaded ${products.length} products`);
        } catch (err) {
            console.error(err);
        }
    }
    const result = products.flat(Infinity).filter((v,i,s) => s.findIndex(v2 => v2.id === v.id) === i);
    return result;
};

module.exports = { grabProducts };