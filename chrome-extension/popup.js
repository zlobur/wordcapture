const statusEl = document.getElementById("status");
const linkBtn = document.getElementById("linkBtn");
const unlinkBtn = document.getElementById("unlinkBtn");
const extIdEl = document.getElementById("extId");

chrome.storage.local.get("extensionId", (data) => {
    if (data.extensionId) {
        extIdEl.textContent = data.extensionId;
    }
});

linkBtn.addEventListener("click", () => {
    chrome.storage.local.get("extensionId", (data) => {
        if (data.extensionId) {
            chrome.tabs.create({ url: `https://t.me/wordcapture_bot?start=${data.extensionId}` });
        }
    });
});

unlinkBtn.addEventListener("click", () => {
    const newId = crypto.randomUUID();
    chrome.storage.local.set({ extensionId: newId }, () => {
        extIdEl.textContent = newId;
        statusEl.textContent = "Новый ID создан";
    });
});
