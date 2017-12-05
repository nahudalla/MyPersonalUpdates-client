(function () {

const RESPONSE_SYM = Symbol("Response");

window.Server = new (class {
    async doRequest(path, config) {
        path = new URL(path, window.location);

        if((config.method === "POST" ||
            config.method === "PUT"
           ) && typeof config.body === "object") {
            config.body.token = Auth.token;
        } else {
            path.searchParams.set('token', Auth.token);
        }

        if(typeof config.body === "object") {
            config.body = JSON.stringify(config.body);
        }

        const req = new Request(
            path.href,
            Object.assign(
                {
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                },
                config
            )
        );

        let res;
        try {
            res = await fetch(req);
        } catch (e) {
            console.error(e);
            throw new Exception("Error inesperado al realizar peticion.");
        }

        if(!res.ok)
            return res;

        let json;
        try {
            json = await res.json();
        } catch (e) {
            console.error(e);
            throw new Exception("Error al recibir datos del servidor.");
        }

        json[RESPONSE_SYM] = res;

        return json;
    }

    responseOK(response) {
        return typeof response === "object" && !(response instanceof Response);
    }

    rawResponseFromJSON(jsonResponse) {
        return jsonResponse[RESPONSE_SYM];
    }

    GET(path) {
        return this.doRequest(path, {
            method: "GET"
        });
    }

    DELETE(path) {
        return this.doRequest(path, {
            method: "DELETE"
        });
    }

    POST(path, body) {
        return this.doRequest(path, {
            method: 'POST', body
        });
    }

    PUT(path, body) {
        return this.doRequest(path, {
            method: 'PUT',
            body: body
        });
    }
});
})();