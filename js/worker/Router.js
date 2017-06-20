define(
["/routes.js"], (routes) => {
    if(!Array.isArray(routes))
        throw new Error("Invalid routes.");

    return {
        getPathInfo(path) {
            const p = path.replace(/^\//, "").replace(/\.html$/,"");
            for(let i = 0, j = routes.length; i < j; i++)
                if(routes[i].path.test(p))
                    return routes[i];
        }
    };
});