(function () {
    class RedditUpdate extends Update {
        // TODO: arreglar!
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
            const fragment = $(document.createDocumentFragment());
            if(typeof this.attributes['Titulo'] === "string")
                fragment.append(`<span style="font-weight: bolder;">${this.attributes['Titulo']}</span>&nbsp;`);

            if(typeof this.attributes.Cuerpo === "string")
                fragment.append(`<span>${this.attributes.Cuerpo}</span>&nbsp;`);

            const imgs = this.attributes['Imagenes de previsualizacion'];
            if(imgs && Array.isArray(imgs)) {
                for(let img of imgs) {
                    fragment.append(`<img src="${img}" width="100">`);
                }
            }
            return fragment;
        }
    }

    const PROVIDER_ID = 2;
    const CALLBACK_STATE_NAME = 'REDDIT_LOGIN_CALLBACK_STATE_CODE';
    window.Reddit = new (class _ extends Provider {
        constructor() {
            super(PROVIDER_ID);
        }

        createUpdate(data) {
            return new RedditUpdate(data);
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

        async finishUserLogin() {
            const url = new URL(window.location);

            const state_code = url.searchParams.get('state');

            if(window.sessionStorage.getItem(CALLBACK_STATE_NAME) !== state_code)
                throw new Exception('Estado de vinculación de Reddit inválido.');

            url.searchParams.delete('state');

            const body = {};

            for(let param of url.searchParams.entries()) {
                body[param[0]] = param[1];
            }

            const res = await this.__postAction('login', body);

            return Server.responseOK(res);
        }

        async setupAuthLink(link, textOnSuccess, textOnError, workingText, setupCallback) {
            link.text(textOnSuccess);
            link.prop('href', '');
            link.one('click', function (e) {
                e.preventDefault();

                link.text(workingText);
                link.removeProp('href');

                const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

                let str = "";

                for(let c = 0; c < 20; c++) {
                    const i = Math.floor(Math.random() * (letters.length));
                    if(Math.random() < 0.5) {
                        str+=letters[i];
                    }else{
                        str+=letters[i].toUpperCase();
                    }
                }

                window.sessionStorage.setItem(CALLBACK_STATE_NAME, str);

                const callback = 'http%3A%2F%2Flocalhost%2FRedditLoginCallback.html';
                const client_id = 'h_juICXhVJ_A5A';

                const win = window.open(`https://www.reddit.com/api/v1/authorize?client_id=${client_id}&response_type=code&state=${str}&redirect_uri=${callback}&duration=permanent&scope=read`, '_blank');
                win.focus();
                const timer = setInterval(function() {
                    if(win.closed) {
                        clearInterval(timer);
                        setupCallback();
                    }
                }, 1000);
            });
        }


    });
})();
