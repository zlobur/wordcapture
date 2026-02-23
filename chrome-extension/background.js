chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "enrich") {
        fetch(`http://localhost:5092/translate?text=${encodeURIComponent(request.word)}`, {
            method: "POST"
        })
            .then(r => r.json())
            .then(result => sendResponse({ success: true, result }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        return true; // держит канал открытым для async ответа
    }
});
