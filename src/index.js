const { Queue } = require("./utils");
const { scrape: scrapeMegaImage } = require('./scripts/mega-image/index');


Queue.overflow = 10;
Queue.push(scrapeMegaImage);
Queue.pause = false;