define(["./EventTarget", "./Event"], (EventTarget, Event) => {
    const SYNC_CALL_MSG_TYPE = "SYNC_CALL";
    const SYNC_RESPONSE_MSG_TYPE = "SYNC_RESPONSE";
    const SYNC_CALL_ERROR_MSG_TYPE = "SYNC_CALL_ERROR";
    const ASYNC_EVENT_MSG_TYPE = "ASYNC_EVENT";
    const PORT_READY_QUERY_MSG_TYPE = "PORT_READY_QUERY";
    const PORT_READY_MSG_TYPE = "PORT_READY";
    const SYNC_CALL_AVAILABLE = "SYNC_CALL_AVAILABLE";

    function onPortReadyQuery() {
        sendMessage.call(this, {type:PORT_READY_MSG_TYPE});
    }
    function onPortReadyMsg() {
        if(!this._portReady) {
            this._portReady = true;

            flushQueue.call(this);
        }
    }
    function onSyncCallAvailable(data) {
        const queue = [{
            dest: this._remoteCallables,
            src: data,
            str: ""
        }];

        while(queue.length) {
            const {dest, src, str} = queue.shift();

            src.callables.forEach(name => {
                const remoteName = `${str}${str?'.':''}${name}`;
                dest[name] = (...args) => callRemote.call(this, remoteName, ...args);
            });

            Object.keys(src.childs).forEach(childName => {
                const newStr = `${str}${str?'.':''}${childName}`;
                if(!dest[childName])
                    dest[childName] = {};
                queue.push({
                    dest: dest[childName],
                    src: src.childs[childName],
                    str: newStr
                });
            });
        }
    }

    function onAsyncEventMsg(message) {
        this.dispatchEvent(new Event(message.name, message.data));
    }
    async function onSyncCall(message) {
        if(!Array.isArray(message.data))
            throw new TypeError("Message data must be an array.");

        const returnError = (e) => {
            message.type = SYNC_CALL_ERROR_MSG_TYPE;
            message.data = e.message;
            this._port.postMessage(message);
        };

        let callable;
        if (!(callable = this._callables[message.name])) {
            const err = new Error(`Call to undefined callable ${message.name}`);
            returnError(err);
            throw err;
        }

        try {
            message.type = SYNC_RESPONSE_MSG_TYPE;
            message.data = await callable(...message.data) || null;
            this._port.postMessage(message);
        }catch(e){
            returnError(e);
            throw e;
        }
    }
    function onSyncCallResponseOrError(message) {
        if(typeof message.callID !== "string")
            throw new TypeError("Message callID must be a string.");

        let awaiting = this._awaitingCalls[message.name];
        const promise = awaiting[message.callID];

        if(message.type === SYNC_RESPONSE_MSG_TYPE)
            promise.resolve(message.data);
        else
            promise.reject(new Error(message.data));

        delete awaiting[message.callID];

        while(awaiting.nextID && awaiting[`_${awaiting.nextID-1}`] === undefined)
            awaiting.nextID--;

        if(!awaiting.length)
            delete this._awaitingCalls[message.name];
    }

    async function onMessage(e) {
        let message = e.data;

        switch (message.type) {
            case PORT_READY_QUERY_MSG_TYPE: return onPortReadyQuery.call(this);
            case PORT_READY_MSG_TYPE:       return onPortReadyMsg.call(this);
            case SYNC_CALL_AVAILABLE:       return onSyncCallAvailable.call(this, message.data);
        }

        if(typeof message.name !== "string")
            throw new TypeError("Message name must be a string.");

        switch (message.type) {
            case ASYNC_EVENT_MSG_TYPE:     onAsyncEventMsg.call(this, message); break;
            case SYNC_CALL_MSG_TYPE:       onSyncCall.call(this, message); break;
            case SYNC_RESPONSE_MSG_TYPE:
            case SYNC_CALL_ERROR_MSG_TYPE: onSyncCallResponseOrError.call(this, message); break;
        }
    }

    function flushQueue() {
        while(this._msgQueue.length) {
            const {message, promise} = this._msgQueue.shift();
            this._port.postMessage(message);
            promise.resolve();
        }

        delete this._msgQueue;
    }

    function sendMessage(message) {
        if(!this._portReady) {
            return new Promise((resolve, reject) => {
                this._msgQueue.push({
                    message:message,
                    promise:{resolve:resolve, reject:reject}
                });
            });
        }else {
            this._port.postMessage(message);
        }
    }

    function callRemote(name, ...args) {
        if(!this._started)
            this.start();

        const awaiting = this._awaitingCalls[name] = this._awaitingCalls[name] || {nextID:0};

        return new Promise((resolve, reject) => {
            const id = `_${awaiting.nextID++}`;

            awaiting[id] = {resolve:resolve, reject:reject};

            sendMessage.call(this, {
                type : SYNC_CALL_MSG_TYPE,
                name : name,
                data : [...args],
                callID : id
            });
        });
    }

    class PortWrapper extends EventTarget {
        constructor(port) {
            super();

            console.assert(port instanceof MessagePort, "Invalid port.");

            this._port = port;
            this._callables = {};
            this._availableCallables = {
                callables: [],
                childs: {}
            };
            this._remoteCallables = {};
            this._awaitingCalls = {};
            this._started = false;
            this._portReady = false;
            this._msgQueue = [];

            this._port.addEventListener("message", onMessage.bind(this), true);

            this._port.postMessage({type:PORT_READY_MSG_TYPE});
            this._port.postMessage({type:PORT_READY_QUERY_MSG_TYPE});
        }

        send(eventName, data) {
            this.start();

            return sendMessage.call(this, {
                type : ASYNC_EVENT_MSG_TYPE,
                name : eventName,
                data: data
            });
        }

        setCallable(info) {
            this.start();

            if(typeof info !== "object")
                throw new Error("Invalid callable information.");

            const newCallables = {
                callables : [],
                childs : {}
            };

            const queue = [
                {
                    src: info,
                    dest: this._availableCallables,
                    copy: newCallables,
                    str: ""
                }
            ];

            while(queue.length) {
                const {src, dest, copy, str} = queue.shift();

                Object.keys(src).forEach(key => {
                    const newStr = `${str}${str?'.':''}${key}`;

                    if(typeof this._callables[newStr] === "function")
                        throw new Error(`Callable "${newStr}" already defined.`);

                    const tSrc = typeof src[key];
                    if(tSrc === "function") {
                        if(dest.childs.hasOwnProperty(key))
                            throw new Error(`Cannot redefine "${newStr}" namespace as callable.`);

                        this._callables[newStr] = src[key];
                        dest.callables.push(key);
                        copy.callables.push(key);
                    }else if(tSrc === "object"){
                        copy.childs[key] = {
                            callables: [],
                            childs: {}
                        };
                        if(!dest.childs[key])
                            dest.childs[key] = {
                                callables: [],
                                childs: {}
                            };

                        queue.push({
                            src: src[key],
                            dest: dest.childs[key],
                            copy: copy.childs[key],
                            str: newStr
                        });
                    }else
                        throw new Error(`Invalid callable info for "${newStr}".`);
                });
            }

            return sendMessage.call(this, {
                type: SYNC_CALL_AVAILABLE,
                data: newCallables
            });
        }

        get call() {
            return this._remoteCallables;
        }

        start() {
            if(this._started)
                return;

            this._started = true;
            return this._port.start();
        }
    }

    return PortWrapper;
});
