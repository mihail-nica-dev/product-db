const EventEmitter = require('events');



const events = new EventEmitter();
const ready = {
    mongo: false,
    browser: false,
};
const emitReady = (key) => {
    ready[key] = true;
    console.log(`${key} is ready`);
    if(Object.values(ready).every(Boolean)) {
        console.log('All systems are ready');
        events.emit('ready');
    }
};
events.on('ready:mongo', () => emitReady('mongo'));
events.on('ready:browser', () => emitReady('browser'));
events.on('ready:server', () => emitReady('server'));
module.exports = {events};
