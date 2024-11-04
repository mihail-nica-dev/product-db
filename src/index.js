const { Queue } = require("./utils");
const { scrape: scrapeMegaImage } = require('./scripts/mega-image/index');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { events } = require("./utils/events");
const { getBrowser } = require("./utils/browser");
dotenv.config();
app.use(cors());
app.use((req, res, next) => {
    // const token = req.headers.authorization;
    // if (token) {
    //     jwt.verify(token, process.env.JWT_SECRET);
    // }
    next();
});

Queue.overflow = 10;

app.get('/scrape/mega-image', (req, res) => {
    Queue.push(scrapeMegaImage);
    console.log('Scraping started');
    res.send('Scraping started');
});

app.listen(3000, () => {
    events.emit('ready:server');
    getBrowser().then(() => {
        events.emit('ready:browser');
    });
});
events.on('ready', () => {
    console.clear();
    console.log('All systems are ready');
    console.log('API is listening on port '+process.env.PORT);
});
