import {CONFIG, RuntimeMessage} from "./config.js";

export async function captureTab(url: string): Promise<string | null> {
    const [tab, window] = await findOrCreateMainTab(url);
    if (!tab || !window) {
        return null;
    }

    const [snapErr, image] = await safe(
        withTimeout(chrome.tabs.captureVisibleTab(), CONFIG.TIMEOUT_MS.SCREENSHOT, "Screenshot timed out")
    );
    if (snapErr || !image) {
        console.error("Failed to capture screenshot at: ", tab.url);
        console.error(snapErr?.message);
        return null;
    }
    console.info("Captured screenshot at: ", tab.url);
    return image
}

export async function downloadFile(dataUrl: string, fileName: string, timeStamp: boolean, save_as: boolean): Promise<number | null> {
    const timestamp = timeStamp ? "-" + new Date().toISOString().replace(/[:.]/g, '-') : "";
    const finalName = `${fileName}${timestamp}.png`;

    const [err, downloadId] = await safe(chrome.downloads.download({
        url: dataUrl,
        filename: finalName,
        conflictAction: 'uniquify',
        saveAs: save_as,
    }));

    if (err || !downloadId) {
        console.error("Failed to save file to :", finalName);
        return null;
    }
    console.info("Saved file to: ", finalName);
    return downloadId;
}

async function findOrCreateMainTab(url: string): Promise<[chrome.tabs.Tab, chrome.windows.Window] | [null, null] > {
    const tabs = await findTabs({ url: url });
    if (!tabs) return [null, null];
    let targetTab: chrome.tabs.Tab | null = tabs[0];
    if (targetTab && targetTab.id) {
        if(!await refreshTab(targetTab.id)) return [null, null]
        const tabs = await findTabs({ url: url });
        if (!tabs) return [null, null];
        targetTab = tabs[0];
        if (!targetTab || !targetTab.id) return [null, null]
    } else {
        const newTab = await createTab(url);
        if (!newTab || !newTab.id) {
            return [null, null]
        }
        targetTab = newTab;
    }
    targetTab = await confirmTabLoadingComplete(targetTab);
    if (!targetTab) return [null, null];
    targetTab = await makeActiveTab(targetTab);
    if (!targetTab) return [null, null];
    const window = await focusWindow(targetTab);
    if (!window) return [null, null];

    if (!validateTabAndWindow(url, targetTab, window)) return [null, null];
    return [targetTab, window];
}

function validateTabAndWindow(url: string, tab: chrome.tabs.Tab, window: chrome.windows.Window): boolean {
    console.info("Validating tab and window");
    if (!tab.id || !window.id) {
        console.error("Tab or window has no id");
        console.error(tab.id);
        console.error(window.id);
        return false;
    }
    console.info("Tab and window ids are non null");
    if (tab.windowId !== window.id) {
        console.error("Tab and window ids do not match. Tab windowId: ", tab.windowId, "Window id: ", window.id);
        return false;
    }
    console.info("Tab.windowId and window.id match.");
    if (tab.status !== "complete") {
        console.error("Tab is not ready. Status: ", tab.status);
        return false;
    }
    console.info("Tab status is complete.");
    if (tab.url !== url) {
        console.error("Tab url does not match. Expected: ", url, "Actual: ", tab.url);
        return false;
    }
    console.info("Tab url matches.");
    if (!tab.active) {
        console.error("Tab is not active");
        return false;
    }
    console.info("Tab is active.");
    if (!window.focused) {
        console.error("Window is not focused");
        return false;
    }
    console.info("Window is focused.");
    console.info("Validation successful.");
    return true
}

export async function findTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[] | null> {
    const [queryErr, tabs] = await safe(chrome.tabs.query(queryInfo));
    if (queryErr || tabs === null) {
        console.error("Critical Chrome API error during tab query", queryErr);
        return null;
    } else if (tabs.length === 0) {
        console.warn("No tabs found. Query: ", queryInfo);
        return null;
    }
    console.info("Found existing tabs. Query: ", queryInfo);
    return tabs;
}

async function refreshTab(tabId: number): Promise<boolean> {
    const [reloadErr, _] = await safe(chrome.tabs.reload(tabId, { bypassCache: true }));
    if (reloadErr) {
        console.error("Failed to refresh tab: ", tabId);
        return false;
    }
    console.info("Refreshed tab: ", tabId);
    return true;
}

async function createTab(url: string): Promise<chrome.tabs.Tab | null> {
    const [newTabError, newTab] = await safe(chrome.tabs.create({ url: url }));
    if (newTabError || !newTab || !newTab.id) {
        console.error("Failed to create tab. url: ", url);
        return null;
    }
    console.info("Created new tab for url: ", url);
    return newTab;
}

async function makeActiveTab(initTab: chrome.tabs.Tab): Promise<chrome.tabs.Tab | null> {
    if (!initTab.id) {
        console.error("Failed to make tab active. Tab has no id: ", initTab.url);
        return null;
    }
    if (!initTab.active) {
        const [tabUpdError, tabUpdated] = await safe(chrome.tabs.update(initTab.id, { active: true }));
        if (tabUpdError || !tabUpdated || !tabUpdated.active) {
            console.error("Failed to bring tab to focus. url: ", initTab.url);
            console.error(tabUpdError?.message);
        return null;
        }
        console.info("Brought tab to focus. url: ", tabUpdated.url);
        return tabUpdated;
    }
    console.info("Tab was already active. url: ", initTab.url);
    return initTab;
}

async function focusWindow(initTab: chrome.tabs.Tab): Promise<chrome.windows.Window | null> {
    const [windUpdError, windowUpdated] = await safe(chrome.windows.update(initTab.windowId, { focused: true }));
    if (windUpdError || !windowUpdated || !windowUpdated.focused) {
        console.error("Failed to bring window to focus. It might have been closed. url: ", initTab.url)
        console.error(windUpdError?.message)
        return null;
    }
    console.info("Brought window to focus. url: ", initTab.url);
    console.info("Window id: ", windowUpdated.id);
    return windowUpdated;
}

async function confirmTabLoadingComplete(initTab: chrome.tabs.Tab): Promise<chrome.tabs.Tab | null> {
    if (!initTab.id) {
        console.error("Failed to confirm tab loading complete. Tab has no id: ", initTab.url);
        return null;
    }
    if (initTab.status !== 'complete') {
        const [err, tab] = await safe(withTimeout(waitForTabComplete(
                initTab.id),
            CONFIG.TIMEOUT_MS.PAGE_LOAD,
            "Wait for load timeout"));
        if (err || !tab) {
            console.error("Could not wait for tab to complete loading: ", initTab.url);
            console.error(err?.message);
            return null;
        }
        console.info("Successfully waited for tab to complete loading: ", tab.url);
        return tab;
    }
    console.info("Tab was ready: ", initTab.url);
    return initTab;
}

export function waitForTabComplete(tabId: number): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
        const listener = (id: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
            const isComplete = changeInfo.status === 'complete' || tab.status === 'complete';
            const hasUrl = tab.url && tab.url !== "" && tab.url !== "about:blank";

            if (id === tabId && isComplete && hasUrl) {
                chrome.tabs.onUpdated.removeListener(listener);
                console.info("Tab is ready with URL:", tab.url);
                resolve(tab);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

export function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage: string = "Operation timed out"
): Promise<T> {
    let timeout: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);
    });

    return Promise.race([
        promise,
        timeoutPromise
    ]).finally(() => {
        clearTimeout(timeout);
    });
}

export async function saveDataToSession(key: string, data: any): Promise<boolean> {
    const [saveErr, _] = await safe(chrome.storage.session.set({ [key]: data }));
    if (saveErr) {
        console.error("Failed to save data to session storage: ", key);
        return false;
    }
    console.info("Saved data to session storage: ", key);
    return true;
}

export async function getDataFromSession(key: string): Promise<unknown | null> {
    const [loadErr, result] = await safe(chrome.storage.session.get([key]));
    if (loadErr || result === null || !(key in result)) {
        console.error("Failed to load data from session storage: ", key);
        return null;
    }
    console.info("Loaded data from session storage: ", key);
    return result[key];
}

export async function safe<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
    try {
        const data = await promise;
        return [null, data];
    } catch (err) {
        return [err instanceof Error ? err : new Error(String(err)), null];
    }
}

export function extractTaskId(url: string): string | null {
    // Regex breakdown:
    // \/tasks\/  : looks for the literal string "/tasks/"
    // (\d+)      : capturing group that matches one or more digits
    // -          : looks for the following hyphen
    const match = url.match(/\/tasks\/(\d+)-/);
    return match ? match[1] : null;
}

export function sendRuntimeMessage(msg: RuntimeMessage) {
    chrome.runtime.sendMessage({ action: msg }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Background script unreachable:", chrome.runtime.lastError);
            return;
        }
        if (response?.success) {
            console.log("Background script started the process!");
        }
    });
}
