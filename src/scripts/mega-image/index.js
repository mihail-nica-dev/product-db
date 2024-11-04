const {  wait, Image } = require('../../utils');
const { browser: browserConfig, context: contextConfig } = require('../../../config');
const { grabProducts } = require('./grabProducts');
const { scrollPage, getScrollHeight, scrollToElement, getBrowser } = require('../../utils/browser');
const cheerio = require('cheerio');
const { extractAccordionData } = require('./grabProductInfo');
const { Metadata } = require('../../schema/metadata');
const { Product,Source } = require('../../schema');
/**
 * Accepts cookies on the page if the cookie popup is present.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @returns {Promise<void>}
 */
const acceptCookies = async (page) => {
    await wait(1000);
    await page.evaluate(() => {
        const cookieButton = document.querySelector('[data-testid="cookie-popup-accept"]');
        if (cookieButton) cookieButton.click();
    });
    await wait(1000);
};
const categories = [
    "https://www.mega-image.ro/Fructe-si-legume-proaspete/c/001",
    "https://www.mega-image.ro/Lactate-si-oua/c/002",
    "https://www.mega-image.ro/Mezeluri-carne-si-ready-meal/c/003",
    "https://www.mega-image.ro/Produse-congelate/c/004",
    "https://www.mega-image.ro/Paine-cafea-cereale-si-mic-dejun/c/005",
    "https://www.mega-image.ro/Dulciuri-si-snacks/c/006",
    "https://www.mega-image.ro/Ingrediente-culinare/c/007",
    "https://www.mega-image.ro/Apa-si-sucuri/c/008",
    "https://www.mega-image.ro/Bauturi-si-tutun/c/009",
    "https://www.mega-image.ro/Natural-and-sanatos/c/010",
    "https://www.mega-image.ro/Curatenie-si-nealimentare/c/013",
    "https://www.mega-image.ro/Mama-si-ingrijire-copil/c/011",
    "https://www.mega-image.ro/Cosmetice-si-ingrijire-personala/c/012",
    "https://www.mega-image.ro/Animale-de-companie/c/014",
    "https://www.mega-image.ro/Produse-sezoniere/c/015",
    "https://www.mega-image.ro/promotii-online",
    "https://www.mega-image.ro/Bun-la-pret/c/7_newcateg?utm_source=homepage&utm_medium=mega+menu&utm_campaign=bun-la-pret",
    "https://www.mega-image.ro/Calitate-la-preturi-bune-zi-de-zi/c/1_newcateg?utm_source=homepage&utm_medium=mega+menu&utm_campaign=calitate-le-preturi-bune",
    "https://www.mega-image.ro/halloween?utm_source=homepage&utm_medium=mega+menu&utm_campaign=halloween",
    "https://www.mega-image.ro/exclusiv-online",
    "https://www.mega-image.ro/produse-noi"
];
const scrapeCategory = async (categoryUrl) => {
    console.log(`Scraping ${categoryUrl}`);
    let products = [];
    const context = await getBrowser(contextConfig);
    const page = await context.newPage();
    await page.goto(`https://www.mega-image.ro`);
    await page.waitForLoadState('load');
    const sourceData = await page.evaluate(() => ({
        title: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        url: document.URL,
        image: document.querySelector('[data-testid="header-logo"]')?.querySelector('img')?.getAttribute('src'),
    }));
    const source = new Source(sourceData);
    await source.save();
    await page.goto(categoryUrl);
    await wait(1000);
    await acceptCookies(page);
    await wait(1000);
    for(const i of [1,2]) {
        await scrollPage(page, 'up', 100, 10);
        await scrollToElement(page, '[data-testid="vertical-load-more-wrapper"]');
        await wait(1000 * i);
        products = products.concat(await grabProducts(page,source, false, context));
        await wait(1000 * i);
    }
    products = products.filter((v,i,s) => s.findIndex(v2 => v2.id === v.id) === i);
    console.log(`Products: ${products.length}`);
    for(const p of products) {
        await page.goto(`https://www.mega-image.ro${p.product_url}`);
        await wait(1000);
        await scrollPage(page, 'down', 100, 10);
        await wait(1000);
        await scrollPage(page, 'up', 100, 10);
        await wait(1000);
        const html = await page.content();
        const details = await extractAccordionData(html);
        const descriptionMetadata =  new Metadata({
            title: 'description',
            description: 'product.description',
            type: 'description',
            key: 'product.description',
            value: details.description,
        });
        const ingredientsMetadata = new Metadata({
            title: 'ingredients',
            type: 'ingredients',
            description: 'product.ingredients',
            key: 'product.ingredients',
            value: details.ingredients,
        });
        const allergensMetadata = new Metadata({
            title: 'allergens',
            type: 'allergens',
            description: 'product.allergens',
            key: 'product.allergens',
            value: details.allergens,
        });
        const images = [];
        if(details.highResIMG) {
            const image = new Image({
                url: details.highResIMG
            });
            await image.save();
            images.push(await image.toJSON());
        }
        const imagesMetadata = new Metadata({
            title: 'images',
            type: 'images',
            description: 'product.images',
            key: 'product.images',
            value: images,
        });
        const productPayload = {
            id: p.id,
            source: await source.toJSON(),
            title: p.title,
            url: p.product_url,
            prices: p.prices,
        };
        console.log({productPayload, prices: productPayload.prices[0]});
        const product = new Product(productPayload);
        if(Array.isArray(details.description)) {
            if(details.description.length > 0) {
                product.addMetadata(descriptionMetadata);
            }
        }
        if(Array.isArray(details.ingredients)) {
            if(details.ingredients.length > 0) {
                product.addMetadata(ingredientsMetadata);
            }
        }
        if(Array.isArray(details.allergens)) {
            if(details.allergens.length > 0) {
                product.addMetadata(allergensMetadata);
            }
        }
        if(images.length > 0) {
            product.addMetadata(imagesMetadata);
        }
        await product.save().catch(console.error).finally(() => console.log(`Saved ${product.id}`));
    }
};
module.exports = {
    scrape: async () => {
        for(const category of categories) {
            await scrapeCategory(category);
        }
    }
}