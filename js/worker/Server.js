define(()=>{
    let config = {
        baseURL : new URL(self.location.href),
        includeCredentials: true
    };

    let exports = {
        configure(values) {
            if (typeof values === "object")
                Object.keys(values).forEach(key => config[key] = values[key]);

            checkConfig();
        },

        get(path, expectedResponseTypes) {
            return (async () => {
                const response = await exports.fetchJSON(new URL(path, config.baseURL));
                return checkResponseTypes(response, expectedResponseTypes);
            })();
        },

        post(path, data, expectedResponseTypes) {
            return (async () => {
                const response = await exports.fetchJSON(new URL(path, config.baseURL), {
                    method: "POST",
                    body: JSON.stringify(data)
                });
                return checkResponseTypes(response, expectedResponseTypes);
            })();
        },

        fetchJSON(url, options) {
            const _url = new URL(url, config.baseURL);
            if (typeof options !== "object")
                options = {};

            if (config.includeCredentials === true && typeof options.credentials === "undefined")
                options.credentials = "include";

            return fetch(_url, options).then(response => {
                if(!response.ok)
                    throw new ServerError({
                        code: response.status,
                        text: response.statusText,
                        url: response.url
                    }, `Could not load URL "${_url.href}".`);

                return response.json();
            });
        }
    };

    class ServerErrorBase extends Error {
        constructor(data, msg) {
            super(msg);
            this._data = data;
        }

        get data() {
            return this._data;
        }
    }

    class ServerError extends ServerErrorBase {
        constructor(...args){super(...args);}
    }
    class UnexpectedResponse extends ServerErrorBase {
        constructor(...args){super(...args);}
    }
    class InvalidResponse extends ServerErrorBase {
        constructor(...args){super(...args);}
    }

    exports.ServerError = ServerError;
    exports.UnexpectedResponse = UnexpectedResponse;
    exports.InvalidResponse = InvalidResponse;

    function checkResponseTypes(data, expectedResponseTypes) {
        if (!Array.isArray(expectedResponseTypes)) {
            if (typeof expectedResponseTypes === "string")
                expectedResponseTypes = [expectedResponseTypes];
            else
                expectedResponseTypes = [];
        }

        if (!data.type || typeof data.type !== "string")
            throw new InvalidResponse(data);
        else if (
            expectedResponseTypes.length &&
            (expectedResponseTypes.includes("*") || expectedResponseTypes.includes(data.type))
        )
            return data;
        else if (data.type === "error")
            throw new ServerError(data);
        else
            throw new UnexpectedResponse(data);
    }

    function checkConfig() {
        if(!(config.baseURL instanceof URL))
            throw new Error('Invalid configuration for "baseURL".');
    }

    return exports;
});
