window.Update = class Update {
    constructor(data) {
        this.__data = data;
    }

    static createUpdate(data) {
        return Provider.getProviderByID(data.providerID).createUpdate(data);
    }

    get renderizable() {
        const _this = this;
        return {
            get provider() {
                return _this.__getRenderizableProvider();
            },
            get date() {
                return _this.__getRenderizableDate();
            },
            get data() {
                return _this.__getRenderizableData();
            },
            get actions() {
                // TODO: do it
                return 'acciones';
            }
        };
    }

    __getRenderizableProvider() {
        throw new Exception('Virtual method not overriden!');
    }
    __getRenderizableDate() {
        throw new Exception('Virtual method not overriden!');
    }
    __getRenderizableData() {
        throw new Exception('Virtual method not overriden!');
    }

    get id() {
        return this.__data.id;
    }

    get provider() {
        return Provider.getProviderByID(this.__data.providerID);
    }

    get timestamp() {
        return this.__data.timestamp;
    }

    get idFromProvider() {
        return this.__data.IDFromProvider;
    }

    get attributes() {
        return this.__data.attributes;
    }
};
