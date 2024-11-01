const { devices } = require('playwright');
module.exports = {
    browser: {
        headless: false
    },
    context: {
        ...devices['iPhone 14'],
        isMobile: undefined
    }
};