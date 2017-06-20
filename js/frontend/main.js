require.config({
    baseUrl: "/js",
    paths: {
        "jquery": [
            "//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min",
            "/js/3rd-party/jquery-3.2.1.min"
        ],
        "DataModel" : "/js/frontend/DataModel",
        "ComponentsManager" : "/js/frontend/ComponentsManager",
        "NavigationManager" : "/js/frontend/NavigationManager"
    }
});

window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errorData = {
        msg:msg,
        url:url,
        lineNo:lineNo,
        columnNo:columnNo,
        href: document.location.href,
        error: {
            name: error.name, // e.g. ReferenceError
            line: error.line, // e.g. x is undefined
            message: error.message,
            stack: error.stack // stacktrace string; remember, different per-browser!
        }
    };

    console.error(errorData);
    // TODO: handle errors correctly
    // TODO: use promise rejection events

    return false;
};

// TODO: create a loading manager, components that show loading indicators subscribe to events and components that perform load operations notify of them

requirejs(["DataModel"], (DataModel) => {
    const baseURL = new URL("/", window.location.href);

    DataModel({
        url: new URL("/js/worker/worker.js", window.location.href)
    });

    DataModel.addEventListener('ready', workerReady);
    DataModel.start();

    function workerReady() {
        requirejs(
            ["ComponentsManager", "NavigationManager"],
            (ComponentsManager, NavigationManager) => {
                const {configure : configureComponents, load:loadComponent} = ComponentsManager;
                const {configure : configureNavigation, load} = NavigationManager;

                configureComponents({
                    baseURL: new URL("/components/", baseURL)
                });
                configureNavigation({
                    baseURL: baseURL
                });
                NavigationManager.setContentContainer(document.body);

                window.addEventListener("popstate", (e) => {
                    load(window.location.href);
                }, true);

                (async ()=>{
                    await loadComponent("loading-dialog");

                    load(window.location.href);
                })();
            }
        );
    }
});
