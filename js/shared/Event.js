define(() => class DataEvent extends Event {
    constructor(type, data) {
        super(type);

        this._data = data;
    }

    get data() {
        return this._data;
    }
});