chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "translate") {
        fetch(`http://localhost:5092/translate?text=${encodeURIComponent(request.word)}`, {
            method: "POST"
        })
            .then(r => r.json())
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        return true;
    }
    if (request.type === "save") {
        fetch(`http://localhost:5092/save?original=${encodeURIComponent(request.original)}&translation=${encodeURIComponent(request.translation)}`, {
            method: "POST"
        })
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        return true;
    }
});
