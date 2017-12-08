window.Provider = class Provider {
    constructor(id) {
        this.__providerID = id;
    }

    static get providers() {
        return [Twitter, Reddit];
    }

    static get availableProviders() {
        return (async ()=> {
            const retProviders = [];

            for(let provider of this.providers) {
                if(!provider.requiresAuthentication || await provider.userAuthenticated) {
                    retProviders.push(provider);
                }
            }

            return retProviders;
        })();
    }

    static getProviderByID(id) {
        for(let provider of this.providers) {
            if(provider.id === id)
                return provider;
        }

        return null;
    }

    get requiresAuthentication() {
        throw new Exception('Virtual method not overriden!');
    }

    get userAuthenticated() {
        throw new Exception('Virtual method not overriden!');
    }

    get attributes() {
        if(this.__attributesCache)
            return this.__attributesCache;

        return (async () => {
            const res = await Server.GET((new URL(`/provider/${this.id}/attribute/all`, window.location)).href);

            if(!Server.responseOK(res))
                throw new Exception(`No se pudieron obtener los atributos del proveedor (${this.id}).`);

            this.__attributesCache = res.attributes;

            return res.attributes;
        })();
    }

    setupAuthLink() {
        throw new Exception('Virtual method not overriden!');
    }

    get id() {
        return this.__providerID;
    }

    get info() {
        if(this.__infoCache)
            return this.__infoCache;

        return (async () => {
            const res = await Server.GET((new URL(`/provider/${this.id}`, window.location)).href);

            if(!(Server.responseOK(res)))
                throw new Exception(`No se pudo obtener la informacion del proveedor (${this.id}).`);

            this.__infoCache = res;

            return res;
        })();
    }

    __postAction(name, body) {
        return Server.POST(
            (new URL(`/provider/${this.id}/action/${name}`, window.location)).href, body
        );
    }

    __getAction(name, options) {
        const url = new URL(`/provider/${this.id}/action/${name}`, window.location);
        if(typeof options === "object" && typeof options.params[Symbol.iterator] === 'function') {
            for(let param of options.params) {
                url.searchParams.set(param[0], param[1]);
            }
        }
        return Server.GET(url.href);
    }
};
