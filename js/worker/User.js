define(
["worker/Server", "worker/requests/UserLoginRequest", "worker/requests/UserSignupRequest"],
(Server, UserLoginRequest, UserSignupRequest) => {
    let exports = {};

    exports.isAuthenticated = async () => {
        let resp = null;
        try {
            resp = await Server.get("ping", ["pong", "not-authenticated"]);
        } catch (e) {
            if (!(e instanceof Server.ServerError) || e.data.code !== 401)
                throw e;
        }

        return resp && resp.type === "pong";
    };

    exports.login = async (user, password) => {
        if (typeof user !== "string" || typeof password !== "string")
            return false;

        const resp = await Server.post("login", new UserLoginRequest(user, password), ["login-ok", "login-invalid-credentials"]);

        return resp.type === "login-ok";
    };

    exports.signup = async (user, password) => {
        if (typeof user !== "string" || typeof password !== "string")
            return false;

        const resp = await Server.post("signup", new UserSignupRequest(user, password), ["signup-ok", "signup-invalid-password", "signup-username-unavailable"]);

        return resp.type === "signup-ok" ? true : resp.type;
    };

    exports.logout = () => {
        return Server.get("logout", ["logout-ok", "not-authenticated"]);
    };

    return exports;
});
