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
                if(!Update.__updateID) {
                    Update.__updateID = 0;
                }

                if(!_this.id) {
                    _this.__data.id = 'rt'+(Update.__updateID++);
                }

                const url = new URL(`/viewStatus.html?id=${_this.id}`, window.location);
                const a = $(document.createElement('a'));
                a.prop('href', url.href);
                a.text('Ver todos los datos');
                a.on('click', function (e) {
                    e.preventDefault();

                    window.sessionStorage.setItem(`UPDATE_DATA_${_this.id}`, JSON.stringify(_this.__data));

                    const win = window.open(url.href, '_blank');
                    win.focus();
                });

                return a;
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
