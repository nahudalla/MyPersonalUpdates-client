(function(){

const TOKEN_KEY = "MPU_AUTH_TOKEN";
const AUTH_URL = "/auth";

window.Auth = new (class {
    constructor() {
        this.__refreshURL = new URL(AUTH_URL, window.location);
    }

    get __authToken() {
        return window.localStorage.getItem(TOKEN_KEY);
    }
    set __authToken(value) {
        if(value === undefined)
            window.localStorage.removeItem(TOKEN_KEY);
        else
            window.localStorage.setItem(TOKEN_KEY, value);
    }

    get token() {
        return this.__authToken;
    }

    get isAuthenticated() {
        return (async () => {
            await this.refresh();
            return this.__authToken !== null;
        })();
    }

    async ensureAuthenticated() {
        Overlay.show("Autenticando...")

        if(!(await this.isAuthenticated)) {
            window.location.href = (new URL("/login.html", window.location)).href;
        }

        Overlay.hide();
    }

    async refresh() {
        if(!this.__authToken) return;

        let res = await Server.GET(AUTH_URL);

        if(Server.responseOK(res)) {
            const status = Server.rawResponseFromJSON(res).status;
            if(status === 200) {
                if(typeof res.token === "string")
                    this.__authToken = res.token;

                // TODO: Agregar código para actualizar los tokens automáticamente con timeToRefresh
            } else this.__authToken = undefined;
        } else {
            console.error(res);
            throw new Exception("Error al actualizar token.");
        }
    }

    async login(username, password) {
        const res = await Server.POST(AUTH_URL, {
                username, password
        });

        if(!Server.responseOK(res)) {
            if(res.status === 403 || res.status === 400)
                throw new Exception("Usuario y/o contraseña incorrectos.");

            console.error(res);
            throw new Exception("Error al iniciar sesion.");
        }

        this.__authToken = res.token;

        window.location.href = (new URL("/", window.location)).href;
    }

    logout() {
        this.__authToken = undefined;
        window.location.href = (new URL("/login.html", window.location)).href;
    }
});
})();
