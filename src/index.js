const { Queue } = require("./utils");
const { scrape: scrapeMegaImage } = require('./scripts/mega-image/index');
const dotenv = require('dotenv');
const { events } = require("./utils/events");
dotenv.config();
Queue.overflow = 10;
Queue.push(scrapeMegaImage);


events.on('ready', () => {
    Queue.pause = false;
});
