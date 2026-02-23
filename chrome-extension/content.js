document.addEventListener("mouseup", () => {
    const word = window.getSelection().toString().trim();
    if (!word) return;

    chrome.runtime.sendMessage({ type: "enrich", word }, (response) => {
        if (response.success) {
            showPopup(response.result, window.getSelection().getRangeAt(0));
        }
    });
});

function showPopup(result, range) {
    document.getElementById("wc-popup")?.remove();

    const rect = range.getBoundingClientRect();

    const popup = document.createElement("div");
    popup.id = "wc-popup";
    popup.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 8}px;
        left: ${rect.left}px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        max-width: 300px;
    `;

    popup.innerHTML = `
    <strong>${result.original}</strong><br>
    <span style="color:#666">${result.translation}</span>
`;

    document.body.appendChild(popup);

    setTimeout(() => {
        document.addEventListener("click", function handler(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener("click", handler);
            }
        });
    }, 100);
}
