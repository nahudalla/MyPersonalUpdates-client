define(["require", "DataModel", "ComponentsManager"],
(require, {User, Router}) => {
    let exports = {};

    let contentContainer = undefined;

    let config = {
        baseURL: new URL(window.location.href),
        authenticationPath: "login.html"
    };
    validateConfig();

    exports.configure = (values) => {
        Object.keys(values).forEach(value =>
            config[value] = values[value]
        );
        validateConfig();
    };

    let goingTo = [];

    exports.setContentContainer = (container) => {
        contentContainer = container;
    };

    exports.getContentContainer = () => {
        return contentContainer;
    };

    exports.navigate = async (url, forced) => {
        url = new URL(url, config.baseURL);

        if(url.origin !== config.baseURL.origin)
            window.location.href = url.href;

        if(!forced && url.href === window.location.href)
            return;

        if(goingTo.includes(url.href))
            throw new Error("Circular redirection detected.");

        goingTo.push(url.href);

        if(!forced || url.href !== window.location.href)
            window.history.pushState(undefined, undefined, url);

        await loadPath(url.pathname);

        goingTo.pop();
    };

    exports.load = async (url) => {
        url = new URL(url, config.baseURL);

        if(url.origin !== config.baseURL.origin)
            throw new Error("External URLs cannot be loaded.");

        await loadPath(url.pathname);
    };

    async function loadPath(path) {
        const container = contentContainer;
        const indicator = require("ComponentsManager").Utils.appendLoadIndicator(contentContainer);

        const pathInfo = await Router.getPathInfo(path);

        if(pathInfo.requiresAuthentication === true && !await User.isAuthenticated()) {
            removeLoadIndicator(container, indicator);
            await exports.navigate(config.authenticationPath);
            return false;
        }

        const uses = pathInfo.uses;

        if(typeof uses !== "string" && !Array.isArray(uses)) {
            removeLoadIndicator(container, indicator);
            throw new Error(`Invalid path info while trying to load path "${path}".`);
        }

        const {load:loadComponent} = require("ComponentsManager");

        if(typeof uses === "string")
            await loadComponent(uses);
        else
            await Promise.all(
                uses.reduce((promises, uses) => {
                    promises.push(loadComponent(uses));
                    return promises;
                }, [])
            );

        removeLoadIndicator(container, indicator);
    }

    function removeLoadIndicator(container, indicator){
        container && indicator && container.hasChildNodes() && Array.from(container.childNodes).includes(indicator) && container.removeChild(indicator);
    }

    function validateConfig() {
        if(!(config.baseURL instanceof URL))
            throw new Error(`Invalid "baseURL".`);
    }

    return exports;
});
