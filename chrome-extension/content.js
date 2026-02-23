console.log("WordCapture content script loaded");
document.addEventListener("mouseup", () => {
    const word = window.getSelection().toString().trim();
    console.log("mouseup word:", word);
    if (!word || word.includes(" ")) return;

    const range = window.getSelection().getRangeAt(0);
    chrome.runtime.sendMessage({ type: "translate", word }, (response) => {
        console.log("response:", response, chrome.runtime.lastError);
        if (response?.success) {
            showPopup(response.result, range);
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

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "+";
    saveBtn.style.cssText = `float:right;margin-left:8px;background:#3b82f6;color:white;border:none;border-radius:6px;padding:2px 8px;font-size:16px;cursor:pointer`;
    saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: "save", original: result.original, translation: result.translation }, () => {
            saveBtn.textContent = "✓";
            saveBtn.style.background = "#22c55e";
            saveBtn.disabled = true;
        });
    });
    popup.innerHTML = `
    <strong>${result.original}</strong><br>
    <span style="color:#666">${result.translation}</span>
`;

    popup.prepend(saveBtn);
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
