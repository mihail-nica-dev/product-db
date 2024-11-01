const playwright = require('playwright');
const { firefox } = playwright;

/**
 * Scrolls the page in a specified direction.
 * @param {import('playwright').Page} page - The Playwright page instance.
 * @param {string} direction - The direction to scroll ('up' or 'down').
 * @returns {Promise<void>}
 */
const scrollPage = async (page, direction = 'down', step = 100, steps = 100) => {
    const directionMap = {
        'down': async () => {
            for(const i of Array({length:steps}).keys()) {
                await page.evaluate((step) => window.scrollTo(0, document.body.scrollHeight - step * i), step);
            }
        },
        'up': async () => {
            for(const i of Array({length:steps}).keys()) {
                await page.evaluate((step) => window.scrollTo(0, step * i), step);
            }
        },
    };
    await directionMap[direction]?.();
};

const scrollToElement = async (page, selector) => {
    const offset = 100;
    await page.evaluate(({selector, offset}) => document.querySelector(selector).scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth', top: offset}), {selector, offset});
};
const getScrollHeight = (page) => page.evaluate(() => document.body.scrollHeight);

module.exports = {
    firefox,
    scrollPage,
    getScrollHeight,
    scrollToElement
};
