define(() => class EventTarget {
    constructor() {
        this._listeners = {};
    }

    addEventListener(type, callback) {
        if (!(type in this._listeners))
            this._listeners[type] = [];

        this._listeners[type].push(callback);
    };

    removeEventListener(type, callback) {
        if (!(type in this._listeners))
            return;

        let listeners = this._listeners[type], index = 0;
        while((index = listeners.indexOf(callback, index)) !== -1)
            listeners.splice(index, 1);
    };

    dispatchEvent(event) {
        console.assert(event instanceof Event);

        if (!(event.type in this._listeners))
            return true;

        this._listeners[event.type].forEach(listener => {
            listener.call(this, event);
        }, this);

        return !event.defaultPrevented;
    };
});
