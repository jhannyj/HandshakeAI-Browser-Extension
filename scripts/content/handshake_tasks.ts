console.log("Handshake AI Util Extension loaded into page");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SELECT_OPTION") {
        const element = document.getElementById(request.id);
        if (element) {
            element.click();
            console.log("Option selected:", request.id);
        }
    }
});