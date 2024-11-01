const cheerio = require('cheerio');
const { wait } = require('../../utils/time');
/**
 * Extracts nutrition, ingredient, and description data from an accordion structure on the page.
 * @param {string} html - The HTML content of the page.
 * @returns {Promise<Object>} The extracted data including nutrition, ingredient, and description information.
 */
const extractAccordionData = async (html) => {
    await wait(300)
    const data = {
        description: null,
    };
    const $ = cheerio.load(html);

    // Iterate through each accordion item
    $('[data-testid*="accordion-item-"]').each((_, item) => {
        const title = $(item).find('[data-testid="collapsable-button-toggle"]').text().trim();

        // Check for nutrition data
        if (title.toLowerCase().includes('nutritie')) {
            const content = $(item).find('table');
            if (content.length) {
                const nutritionData = extractNutritionData(content, $);
                data[title.toLowerCase()] = {
                    title,
                    data: nutritionData
                };
            }
        }

        // Check for ingredient data
        if (title.toLowerCase().includes('alcool')) {
            const contentRaw = $(item).find('div').text().split('\n');
            const content = contentRaw[contentRaw.length - 1];
            data[title.toLowerCase()] = {
                title,
                data: content
            };
        }
        if (title.toLowerCase().includes('ingrediente')) {
            const contentRaw = $(item).find('div').text().split('\n');
            const content = contentRaw[contentRaw.length - 1];
            data[title.toLowerCase()] = {
                title,
                data: content
            };
        }
    });

    // Extract high-resolution image source
    const highResIMG = $('figure img').attr('src');
    data.highResIMG = highResIMG;

    // Extract description from the specified element
    const descriptionElement = $('[data-testid="mobile-quick-access-component"]').prev();
    if (descriptionElement.length) {
        data.description = descriptionElement.text().trim();
    }
return data
};

/**
 * Extracts nutrition data from a table element.
 * @param {Cheerio} table - The Cheerio object containing the table element with nutrition data.
 * @param {CheerioStatic} $ - The Cheerio instance.
 * @returns {Object} An object containing nutrition data.
 */
const extractNutritionData = (table, $) => {
    const nutritionData = {};

    // Iterate through each row to extract key-value pairs
    table.find('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length === 2) {
            const name = $(cells[0]).text().trim();
            const unitParts = $(cells[1]).text().trim().split('/');
            const number = parseInt(unitParts[0]);
            const base = {
                value: parseInt(unitParts[unitParts.length - 1]),
                unit: unitParts[unitParts.length - 1].replace(/[0-9]/g, '')
            };
            const nutrition = {
                value: number,
                unit: unitParts[0].replace(/[0-9]/g, '')
            };
            nutritionData[name.toLowerCase()] = { name, base, nutrition }; // Store in an object
        }
    });

    return nutritionData;
};

module.exports = { extractAccordionData };