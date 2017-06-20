define(["shared/CommunicationPort"], (CommunicationPort) => {
    let port = null;
    let config = {};

    function configure(values) {
        if(typeof values !== "object")
            throw new Error("Invalid configuration object.");

        Object.keys(values).forEach(key => config[key] = values[key]);
        checkConfig();
    }

    function checkConfig() {
        if(!config.url || !(config.url instanceof URL))
            throw new Error(`Invalid value for "url" configuration option.`);
    }

    function getInstance() {
        if(!port) {
            checkConfig();
            port = new CommunicationPort((new SharedWorker(config.url.href)).port);
        }

        return port;
    }

    function getInstanceFor(prop) {
        const instance = getInstance();
        if(Reflect.has(instance, prop))
            return instance;
        else
            return instance.call;
    }

    function isInstantiated() {
        return !!port;
    }

    const proxy = new Proxy(function(){}, {
        apply(_, __, argumentsList) {
            if(isInstantiated())
                throw new Error("Cannot apply configuration after use.");

            configure(...argumentsList);

            return proxy;
        },
        construct(_, argsList) {
            return isInstantiated()?proxy:proxy(...argsList);
        },
        has(_, prop) {
            const instance = getInstance();
            return Reflect.has(instance, prop) || Reflect.has(instance.call, prop);
        },
        get: function (_, prop, ...args) {
            return Reflect.get(getInstanceFor(prop), prop, ...args);
        },
        set: function (_, ...args) {
            return Reflect.set(getInstance(), ...args);
        },
        ownKeys() {
            const instance = getInstance();
            return Reflect.ownKeys(instance).concat(Reflect.ownKeys(instance.call));
        },
        getPrototypeOf(){
            return Reflect.getPrototypeOf(getInstance());
        },
        setPrototypeOf(_, ...args) {
            return Reflect.setPrototypeOf(getInstance(), ...args);
        },
        isExtensible() {
            return Reflect.isExtensible(getInstance());
        },
        preventExtensions() {
            return Reflect.preventExtensions(getInstance());
        },
        getOwnPropertyDescriptor(_, prop) {
            return Reflect.getOwnPropertyDescriptor(getInstanceFor(prop), prop);
        },
        defineProperty(_, ...args) {
            return Reflect.defineProperty(getInstance(), ...args);
        },
        deleteProperty(_, prop) {
            return Reflect.deleteProperty(getInstanceFor(prop), prop);
        }
    });

    return proxy;
});
