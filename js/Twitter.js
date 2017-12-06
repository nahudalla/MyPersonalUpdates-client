(function () {
class TwitterUpdate extends Update {
    constructor(data) {
        super(data);
    }
    async __getRenderizableProvider() {
        return (await this.provider.info).name;
    }
    __getRenderizableDate() {
        const date = new Date(this.timestamp);
        return date.toDateString() + ' ' + date.toTimeString();
    }
    __getRenderizableData() {
        return this.attributes.Texto;
    }
}

const PROVIDER_ID = 1;
window.Twitter = new (class _ extends Provider {
    constructor() {
        super(PROVIDER_ID);
    }

    createUpdate(data) {
        return new TwitterUpdate(data);
    }

    get requiresAuthentication() {
        return true;
    }

    get userAuthenticated() {
        return (async () => {
            const res = await this.__getAction('loginCheck');

            if(!(Server.responseOK(res)))
                return undefined;

            return res.loggedIn;
        })();
    }

    async finishUserLogin(params) {
        const body = {};

        for(let param of params) {
            body[param[0]] = param[1];
        }

        const res = await this.__postAction('login', body);

        return Server.responseOK(res);
    }

    async setupAuthLink(link, textOnSuccess, textOnError, workingText, setupCallback) {
        const res = await this.__getAction('loginURL');

        if(!Server.responseOK(res)) {
            link.text(textOnError);
        } else {
            link.text(textOnSuccess);
            link.prop('href', '');
            link.one('click', function (e) {
                e.preventDefault();

                link.text(workingText);
                link.removeProp('href');

                const win = window.open(res.url, '_blank');
                win.focus();
                const timer = setInterval(function() {
                    if(win.closed) {
                        clearInterval(timer);
                        setupCallback();
                    }
                }, 1000);
            });
        }
    }
});
})();
