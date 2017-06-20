self.importScripts("/js/3rd-party/require.js");

require.config({
    baseUrl: "/js"
});

let waitingPorts = [];

self.addEventListener("error", (e) => {
    //console.error(e);
}, true);

self.onconnect = (e) => {
    waitingPorts.push(e.ports[0]);
};

requirejs(
    ["shared/CommunicationPort", "worker/Router", "worker/User", "worker/Server"],
    (CommunicationPort, Router, User, {configure:configureServer}) => {
        configureServer({
            baseURL: new URL("/", self.location.href)
        });

        self.onconnect = (e) => setupPort(e.ports[0]);

        while(waitingPorts.length)
            setupPort(waitingPorts.pop());
        waitingPorts = undefined;

        async function setupPort(_port) {
            const port = new CommunicationPort(_port);

            await port.setCallable({
                User, Router
            });

            port.send("ready");
        }
    }
);
