define(["frontend/ComponentUtils"], (Utils) => {
    let exports = {};

    let _components = {};
    let _registerPromises = {};
    let _componentsLoading = {};

    let config = {
        extension: "html",
        baseURL: new URL(window.location.href)
    };
    validateConfig();

    exports.Utils = Utils;

    exports.configure = (values) => {
        Object.keys(values).forEach(value => {
            config[value] = values[value];
        });

        validateConfig();
    };

    exports.register = async (component) => {
        if(typeof component.name !== "string")
            throw new Error("Invalid component name.");

        let name = component.name;

        if(_components[name])
            throw new Error("Attempting to register a duplicate component.");

        _components[name] = component;

        let proms;
        if(proms = _registerPromises[component.name]) {
            while(proms.length)
                proms.pop().resolve(component);
            delete _registerPromises[component.name];
        }
    };

    exports.load = async (name) => {
        if(typeof name !== "string")
            throw new Error("Invalid name.");

        // Avoid circular references
        if(!_componentsLoading[name])
            _componentsLoading[name] = 0;
        _componentsLoading[name]++;
        // End avoid circular references

        let component = await loadComponent(name);

        if(component.requires) {
            let requires = component.requires;

            if (typeof requires !== "string" || !Array.isArray(requires))
                throw new Error(`Invalid "requires" field in component "${component.name}".`);

            if (typeof requires === "string")
                await loadRequiredComponent(requires);
            else
                requires.forEach(loadRequiredComponent);
        }

        if(typeof component.load === "function")
            await component.load();

        // Avoid circular references
        _componentsLoading[name]--;
        if(_componentsLoading[name] === 0)
            delete _componentsLoading[name];
        // End avoid circular references

        if(component.uses) {
            let uses = component.uses;

            if(typeof uses !== "string" && !Array.isArray(uses))
                throw new Error(`Invalid "uses" field in component "${name}".`);

            if(typeof uses === "string")
                await exports.load(uses);
            else
                uses.forEach(exports.load);
        }
    };

    async function loadRequiredComponent(name) {
        if(_componentsLoading[name])
            throw new Error(`Possible circular reference detected while attempting to load component "${name}" as a requirement.`);

        await exports.load(name);
    }

    function loadComponent(name) {
        if(_components[name])
            return _components[name];

        return new Promise((resolve, reject) => {
            if(_registerPromises[name]) {
                _registerPromises[name].push({resolve:resolve, reject:reject});
                return;
            }

            let link = document.createElement('link');
            link.rel = 'import';

            const url = new URL(`${name}.${config.extension}`, config.baseURL);

            link.href = url.href;

            link.setAttribute('async', '');
            link.onerror = e => reject(e);

            _registerPromises[name] = [{resolve:resolve, reject: reject}];

            document.head.appendChild(link);
        });
    }

    function validateConfig() {
        if(typeof config.extension !== "string")
            throw new Error("Invalid extension. String expected.");

        if(!(config.baseURL instanceof URL))
            throw new Error("Invalid base URL. URL instance expected.");
    }

    return exports;
});