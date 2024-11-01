const { firefox, wait } = require('../../utils');
const { browser: browserConfig, context: contextConfig } = require('../../../config');
const { Source } = require('../../schema/source');
const { grabProducts } = require('./grabProducts');

/**
 * Scrolls the page in a specified direction.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @param {string} direction - The direction to scroll ('up' or 'down').
 * @returns {Promise<void>}
 */
const scrollPage = async (page, direction = 'down') => {
    const directionMap = {
        'down': () => page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)),
        'up': () => page.evaluate(() => window.scrollTo(0, 0)),
    };
    await directionMap[direction]?.();
};

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

module.exports = {
    scrape: async () => {
        const browser = await firefox.launch(browserConfig);
        const context = await browser.newContext(contextConfig);
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
        await page.goto('https://www.mega-image.ro/search');
        await wait(1000);
        await acceptCookies(page);
        await wait(1000);
        await scrollPage(page, 'down');
        await wait(1000);
        await scrollPage(page, 'up');
        await wait(1000);
        const products = await grabProducts(page,source, false, context);
        console.log(products);
    }
}