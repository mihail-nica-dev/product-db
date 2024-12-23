require('dotenv').config();
const playwright = require('playwright');
const { events } = require('./events');
const { chromium } = require('playwright');

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
let browser;
let context;
const getBrowser = async (config = {}) => {
    console.log('Getting browser', process.env.BROWSERLESS_URL);
    if(!browser) {
        try {
            console.log('Connecting to browserless');
            browser = await playwright.chromium.connect({
                wsEndpoint: process.env.BROWSERLESS_URL
        });
        browser.on('disconnected', () => {
                browser = null;
                console.log('Browser disconnected, retrying...');
                return getBrowser(config);
            });
        context = await browser.newContext(config);
        } catch (err) {
            console.log('Failed to connect to browserless, retrying...');
            return await new Promise((resolve, reject) => setTimeout(() => resolve(getBrowser(config)), 1000));
        }
    }
    console.log('Returning context');
    return context;
};
getBrowser().then(() => {
    events.emit('ready:browser');
});
module.exports = {
    scrollPage,
    getScrollHeight,
    scrollToElement,
    getBrowser
};
