define(["NavigationManager"], (NavigationManager)=>{
    let exports = {};

    exports.emptyDOMNode = (node) => {
        if (!(node instanceof HTMLElement))
            throw new Error("HTML DOM element expected.");

        while (node.firstChild)
            node.removeChild(node.firstChild);
    };

    exports.setupLink = (link) => {
        if(!(link instanceof HTMLElement))
            throw new Error("HTML DOM element expected.");

        if(!link.href || link.dataset.linkListenerAdded)
            return;

        link.addEventListener("click", (e) => {
            e.preventDefault();
            NavigationManager.navigate(new URL(e.target.href, window.location.href));
        }, true);

        link.dataset.linkListenerAdded = true;
    };

    exports.setupLinks = (where) => {
        if(!where.querySelectorAll)
            throw new Error("Element not supported.");

        const setupElems = (which) => {
            const aElements = where.querySelectorAll(which);
            for (let i = 0, j = aElements.length; i < j; ++i)
                exports.setupLink(aElements[i]);
        };

        setupElems("a");
        setupElems("area");

        where.addEventListener("DOMNodeInserted", (e) => {
            if(e.target.tagName === "a" || e.target.tagName === "area")
                exports.setupLink(e.target);
        }, true);
    };

    exports.setupCustomElementFromTemplate = (template, element) => {
        const clone = document.importNode(template.content.cloneNode(true), true);
        const shadowRoot = element.attachShadow({mode: 'open'});
        shadowRoot.appendChild(clone);
        exports.setupLinks(element);
        exports.setupLinks(shadowRoot);
    };

    exports.appendLoadIndicator = (elem) => {
        const indicator = document.createElement("loading-dialog");
        elem.appendChild(indicator);
        return indicator;
    };

    return exports;
});