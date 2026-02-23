chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "translate") {
        fetch(`https://wordcapture.app.zlobur.com/translate?text=${encodeURIComponent(request.word)}`, {
            method: "POST"
        })
            .then(r => { console.log("status:", r.status); return r.text(); })
            .then(text => { console.log("body:", text); return JSON.parse(text); })
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        return true;
    }
    if (request.type === "save") {
        fetch(`https://wordcapture.app.zlobur.com/save?original=${encodeURIComponent(request.original)}&translation=${encodeURIComponent(request.translation)}`, {
            method: "POST"
        })
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        return true;
    }
});
