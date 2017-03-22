(function (winDef, win, this_, factory) {
    let global;
    if(typeof module === "object" && typeof module.exports === "object")
        global = module.exports;
    else if(winDef && typeof win.app !== "object")
        global = win.app = {};
    else if(!winDef)
        global = this_;

    factory(global);
}(typeof window !== "undefined", window, this, function(app) {
    /* CONSTANTS */
    app.BASE_URL = "http://localhost";


    /* ERROR TYPES */
    app.ServerError = function(data) {
        this.getData = () => data;
    };

    app.UnexpectedResponse = function (response) {
        this.getResponse = () => response;
    };

    app.InvalidResponse = function (response) {
        this.getResponse = () => response;
    };


    /* SERVER GET AND POST */
    app.getFromServer = function(path, expectedResponseTypes) {
        return app.fetchJSON(app.BASE_URL+"/"+path)
            .then(checkResponseTypes(expectedResponseTypes));
    };

    app.postToServer = function(path, data, expectedResponseTypes) {
        return app.fetchJSON(app.BASE_URL+"/"+path, {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(checkResponseTypes(expectedResponseTypes));
    };

    app.fetchJSON = function (url, options) {
        if(typeof options !== "object")
            options = {};

        if(typeof options.credentials === "undefined")
            options.credentials = "include";

        return fetch(url, options)
            .then(response => response.json())
    };

    function checkResponseTypes(expectedResponseTypes) {
        if(!Array.isArray(expectedResponseTypes)) {
            if (typeof expectedResponseTypes === "string")
                expectedResponseTypes = [expectedResponseTypes];
            else
                expectedResponseTypes = [];
        }

        return data => {
            if(!data.type || typeof data.type !== "string")
                throw new app.InvalidResponse(data);
            else if(expectedResponseTypes.length && expectedResponseTypes.includes(data.type))
                return data;
            else if(data.type === "error")
                throw new app.ServerError(data);
            else
                throw new app.UnexpectedResponse(data);
        };
    }
}));

(function () {
    function responseHandler(response) {
        console.log(response);
    }

    function errorHandler(error) {
        if(error instanceof app.ServerError)
            console.error("ServerError", error.getData());
        else if(error instanceof app.UnexpectedResponse)
            console.error("UnexpectedResponse", error.getResponse());
        else if(error instanceof app.InvalidResponse)
            console.error("InvalidResponse", error.getResponse());
        else
            console.error(error);
    }

    $(document).ready(() => {
        $("#login").on('click', () => {
            app.postToServer("login", {
                user: $("#username").val(),
                password: $("#password").val()
            }, ["login-ok", "login-invalid-credentials", "not-available"])
                .then(responseHandler)
                .catch(errorHandler);
        });
        $("#signup").on('click', () => {
            app.postToServer("signup", {
                user: $("#username").val(),
                password: $("#password").val()
            }, ["signup-username-unavailable", "signup-invalid-password", "signup-ok", "not-available"])
                .then(responseHandler)
                .catch(errorHandler);
        });
        $("#authTest").on('click', () => {
            app.getFromServer("test", ["not-authenticated", "error"])
                .then(responseHandler)
                .catch(errorHandler);
        });
        $("#logout").on('click', () => {
            app.getFromServer("logout", ["not-authenticated", "logout-ok"])
                .then(responseHandler)
                .catch(errorHandler);
        });
});

}());
