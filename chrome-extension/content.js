document.addEventListener("mouseup", async () => {
    const word = window.getSelection().toString().trim();

    if (!word || word.includes(" ")) return;

    const response = await fetch(`http://localhost:5092/enrich?word=${word}`, {
        method: "POST"
    });

    const result = await response.json();
    showPopup(result, window.getSelection().getRangeAt(0));
});

function showPopup(result, range) {
    document.getElementById("wc-popup")?.remove();

    const rect = range.getBoundingClientRect();

    const popup = document.createElement("div");
    popup.id = "wc-popup";
    popup.style.cssText = `
        position: fixed;
        top: ${rect.bottom + window.scrollY + 8}px;
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
        <strong>${result.word}</strong> ${result.transcription}<br>
        <span style="color:#666">${result.translation}</span><br><br>
        <small>${result.context.replace(/\n/g, "<br>")}</small>
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 8000);
}
