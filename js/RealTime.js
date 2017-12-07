window.RealTime = (new class _RealTime extends UpdatesObservable {
    constructor() {
        super();

        const url = new URL(window.location);
        this.__urlParams = url.searchParams;
        this.__host = url.hostname;
    }

    start(category, callback) {
        const url = `ws://${this.__host}/stream/${this.__urlParams.get('category')}/${Auth.token}`;

        if(this.__socket)
            this.stop();

        this.__socket = new WebSocket(url);

        this.__socket.addEventListener('open', function () {
            console.log(`Connection established with ${url}`);
        });

        this.__socket.addEventListener('message', (event) => {
            const update = Update.createUpdate(JSON.parse(event.data));

            this.__emitUpdates(update);

            callback(undefined, update);
        });

        this.__socket.addEventListener('error', function (e) {
            console.error(e);
            callback(new Exception('Error en la conexión en tiempo real al servidor.'));
        });

        this.__socket.addEventListener('close', function () {
            callback(new Exception('Conexión en tiempo real con el servidor cerrada de manera inesperada.'));
        });
    }

    stop() {
        this.__socket.close();
        this.__socket = undefined;
    }
});
