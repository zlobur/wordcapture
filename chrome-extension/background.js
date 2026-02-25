chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("extensionId", (data) => {
        if (!data.extensionId) {
            chrome.storage.local.set({ extensionId: crypto.randomUUID() });
        }
    });
});

async function getExtensionId() {
    return new Promise((resolve) => {
        chrome.storage.local.get("extensionId", (data) => {
            resolve(data.extensionId);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "translate") {
        getExtensionId().then((id) => {
            fetch(`https://wordcapture.app.zlobur.com/translate?text=${encodeURIComponent(request.word)}`, {
                method: "POST",
                headers: { "X-Extension-Id": id }
            })
                .then(r => r.text())
                .then(text => JSON.parse(text))
                .then(result => sendResponse({ success: true, result }))
                .catch(err => sendResponse({ success: false, error: err.message }));
        });
        return true;
    }
    if (request.type === "save") {
        getExtensionId().then((id) => {
            fetch(`https://wordcapture.app.zlobur.com/save?original=${encodeURIComponent(request.original)}&translation=${encodeURIComponent(request.translation)}`, {
                method: "POST",
                headers: { "X-Extension-Id": id }
            })
                .then(() => sendResponse({ success: true }))
                .catch(err => sendResponse({ success: false, error: err.message }));
        });
        return true;
    }
});
