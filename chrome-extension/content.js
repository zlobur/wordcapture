const wcFont = document.createElement("link");
wcFont.href = "https://fonts.googleapis.com/css2?family=Merriweather&display=swap";
wcFont.rel = "stylesheet";
document.head.appendChild(wcFont);
console.log("WordCapture content script loaded");
document.addEventListener("mouseup", (e) => {
    if (document.getElementById("wc-popup")?.contains(e.target)) return;
    const word = window.getSelection().toString().trim();
    console.log("mouseup word:", word);
    if (!word) return;

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
        background: linear-gradient(145deg, #1e3a5f, #162d4a);
        border: none;
        border-radius: 10px;
        padding: 16px 18px;
        font-family: 'Merriweather', Georgia, serif;
        font-size: 15px;
        color: #e8edf3;
        box-shadow: 4px 4px 10px rgba(0,0,0,0.4), -2px -2px 6px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08);
        z-index: 999999;
        max-width: 320px;
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
    popup.innerHTML = `<span>${result.translation}</span>`;

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
