(function () {

const overlayContainer = document.createElement("div");
overlayContainer.style.position = "absolute";
overlayContainer.style.left = "0";
overlayContainer.style.top = "0";
overlayContainer.style.width = "100%";
overlayContainer.style.height = "100%";
overlayContainer.style.display = "table";
overlayContainer.style.zIndex = 9999999999;
overlayContainer.style.backgroundColor = "#FFF";
overlayContainer.style.fontSize = "3em";
overlayContainer.style.textAlign = "center";

const overlayContent = document.createElement("div");
overlayContent.style.verticalAlign = "middle";
overlayContent.style.display = "table-cell";

overlayContainer.appendChild(overlayContent);

window.Overlay = new (class {
    show(text) {
        overlayContent.innerText = text;

        if(!Array.from(document.body.childNodes).includes(overlayContainer))
            document.body.appendChild(overlayContainer);
    }

    hide() {
        document.body.removeChild(overlayContainer);
    }
});
})();