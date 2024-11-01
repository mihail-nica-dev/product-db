

class Queue {
    static get randomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    static set overflow(value) {
        global._overflow = value;
    }

    static get overflow() {
        return global._overflow;
    }

    static set pause(value) {
        global._pause = value;
    }
    
    static get pause() {
        return global._pause;
    }

    static push(item) {
        const id = this.randomId;
        global._queue[id] = {
            fn:item,
            running: false
        };
    }

    static async execute(item) {
        item.running = true;
        await item.fn().then(() => {
            delete global._queue[item.id];
        });
    }

    static get list() {
        return Object.keys(global._queue).filter(id => !global._queue[id].running).map(id => global._queue[id]);
    }

    static async drain() {
        if(global._pause) {
            return;
        }
        if(this.list.length > this.overflow) {
            const promises = this.list.map(item => this.execute(item));
            await Promise.all(promises);
        }
        while (this.list.length > 0) {
            await this.execute(this.list[0]);
        }
    }
}

global._queue = [];
global._overflow = 10;
global.QUEUE_INTERVAL = setInterval(() => {
    Queue.drain();
}, 1000);
global.QUEUE = Queue;
Queue.pause = true;

module.exports = {
    Queue
};
