import {
    AppConfigs,
    CONST_CONFIGS,
    DEFAULT_APP_CONFIGS,
    RuntimeMessage,
    StorageType,
    StoredData
} from "../scripts/configs";
import {getCurrentTab, getSettingsOrDefault, saveData, sendRuntimeMessage} from "../scripts/util";
import ManifestPermission = chrome.runtime.ManifestPermission;

console.log("Popup opened")

document.addEventListener('DOMContentLoaded', async () => {
    // saveData(StoredData.SETTINGS, DEFAULT_MUTABLE_CONFIGS, CONST_CONFIGS.SETTINGS_STORAGE).then(r => console.log("Saved default settings: ", r))
    loadTabsFunctionality();
    const settings = await getSettingsOrDefault();
    loadConfigsWithFunctionalityToHTML(settings);

    const submitBtn = document.getElementById('btn-submit') as HTMLButtonElement;
    submitBtn.addEventListener('click', () => {
        sendRuntimeMessage(RuntimeMessage.RUN);
    });

    const resetBtn = document.getElementById('btn-reset') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => {
        const confirmReset = confirm("Are you sure you want to reset all advanced settings?");
        if(confirmReset) {
            console.log("Resetting to default...");
            saveData(StoredData.SETTINGS, DEFAULT_APP_CONFIGS, CONST_CONFIGS.SETTINGS_STORAGE).then(r => console.log("Saved default settings: ", r))
            window.location.reload();
        }
    });

    if (settings.runOnClick) {
        const tab = await getCurrentTab();
        if (tab && tab.url) {
            if (tab.url.startsWith(CONST_CONFIGS.TASKS.MULTIMANGO_PREFIX) || tab.url.startsWith(CONST_CONFIGS.TASKS.HANDSHAKE_PREFIX)) {
                console.log("Clicked popup on task page - running extension...");
                sendRuntimeMessage(RuntimeMessage.RUN);
            } else {
                console.log("Clicked popup on non-task page - not running extension...");
            }
        }
    }

});

function loadTabsFunctionality() {
    const settingsTrigger = document.getElementById('settings-trigger') as HTMLElement;
    const settingsWrapper = document.getElementById('settings-wrapper') as HTMLElement;
    const triggerText = document.getElementById('trigger-text') as HTMLElement;
    const triggerIcon = document.getElementById('trigger-icon') as HTMLElement;

    settingsTrigger.addEventListener('click', () => {
        const isHidden = settingsWrapper.classList.contains('hidden');

        if (isHidden) {
            settingsWrapper.classList.remove('hidden');
            triggerText.textContent = "Hide Configuration";
            triggerIcon.textContent = "▲";
        } else {
            settingsWrapper.classList.add('hidden');
            triggerText.textContent = "Show Configuration";
            triggerIcon.textContent = "▼";
        }
    });

    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const tabName = target.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            target.classList.add('active');
            const activeContent = document.getElementById(tabName!) as HTMLElement;
            activeContent.classList.add('active');
        });
    });
}

function loadConfigsWithFunctionalityToHTML(configs: AppConfigs) {
    const runOnClick = document.getElementById('run-onclick') as HTMLInputElement;
    trySetCheckboxValue(runOnClick, configs.runOnClick);
    runOnClick.addEventListener('change', (event) => {
        if (!event.target) return;
        settingButtonChange({runOnClick: (event.target as HTMLInputElement).checked}, ['storage']);
    });
    const runOnTaskChange = document.getElementById('run-ontaskchange') as HTMLInputElement;
    trySetCheckboxValue(runOnTaskChange, configs.runOnTaskChange);
    runOnTaskChange.addEventListener('change', (event) => {
        if (!event.target) return;
        settingButtonChange({runOnTaskChange: (event.target as HTMLInputElement).checked}, ['storage']);
    });

    const tasksAlwaysPickFirst = document.getElementById('tasks-pickfirst') as HTMLInputElement;
    trySetCheckboxValue(tasksAlwaysPickFirst, configs.tasksAlwaysPickFirst);
    tasksAlwaysPickFirst.addEventListener('change', (event) => {
        if (!event.target) return;
        settingButtonChange({tasksAlwaysPickFirst: (event.target as HTMLInputElement).checked}, ['storage']);
    });
    const tasksRememberLast = document.getElementById('tasks-rememberlast') as HTMLInputElement;
    trySetCheckboxValue(tasksRememberLast, configs.tasksRememberLast)
    tasksRememberLast.addEventListener('change', (event) => {
        if (!event.target) return;
        const checked = (event.target as HTMLInputElement).checked;
        settingButtonChange({tasksRememberLast: (event.target as HTMLInputElement).checked}, ['storage']);
        getSettingsOrDefault().then(configs => {
            const storageLastTaskUrl = document.getElementById('store-lasttaskurl') as HTMLSelectElement;
            storageLastTaskUrl.value = checked ? configs.storageLastTaskUrl: StorageType.NONE;
        });
    });

    const feedbackRememberRatings = document.getElementById('qa-rememberratings') as HTMLInputElement;
    trySetCheckboxValue(feedbackRememberRatings, configs.feedbackRememberRatings);
    feedbackRememberRatings.addEventListener('change', (event) => {
        if (!event.target) return;
        const checked = (event.target as HTMLInputElement).checked;
        settingButtonChange({feedbackRememberRatings: (event.target as HTMLInputElement).checked}, ['storage']);
        getSettingsOrDefault().then(configs => {
            const storageRatings = document.getElementById('store-ratings') as HTMLSelectElement;
            storageRatings.value = checked ? configs.storageRatings : StorageType.NONE;
        });
    });
    const feedbackScreenshot = document.getElementById('qa-screenshot') as HTMLInputElement;
    trySetCheckboxValue(feedbackScreenshot, configs.feedbackScreenshot);
    feedbackScreenshot.addEventListener('change', (event) => {
        if (!event.target) return;
        settingButtonChange({feedbackScreenshot: (event.target as HTMLInputElement).checked}, ['storage', 'downloads']);
    })

    const epMaxTries = document.getElementById('ep-maxretries') as HTMLInputElement;
    trySetInputValue(epMaxTries, configs.epMaxTries.toString());
    epMaxTries.addEventListener('change', async (event) => {
        if (!event.target) return;
        settingButtonChange({epMaxTries: (event.target as HTMLInputElement).value}, ['storage']);
    })
    const epInterval = document.getElementById('ep-interval') as HTMLInputElement;
    trySetInputValue(epInterval, configs.epInterval.toString());
    epInterval.addEventListener('change', async (event) => {
        if (!event.target) return;
        settingButtonChange({epInterval: (event.target as HTMLInputElement).value}, ['storage']);
    })
    const epTimeout = document.getElementById('ep-timeout') as HTMLInputElement;
    trySetInputValue(epTimeout, configs.epTimeout.toString());
    epTimeout.addEventListener('change', async (event) => {
        if (!event.target) return;
        settingButtonChange({epTimeout: (event.target as HTMLInputElement).value}, ['storage']);
    })

    const storageRatings = document.getElementById('store-ratings') as HTMLSelectElement;
    trySelectOption(storageRatings, configs.feedbackRememberRatings ? configs.storageRatings : StorageType.NONE);
    storageRatings.addEventListener('change', async (event) => {
        if (!event.target) return;
        const pass = (document.getElementById('qa-rememberratings') as HTMLInputElement).checked;
        if (!pass) {
            showStatus('error', 'Could not update value', 'First enable QA FEEDBACKS > Remember Ratings');
            (event.target as HTMLSelectElement).value = StorageType.NONE;
            return;
        }
        settingButtonChange({storageRatings: (event.target as HTMLSelectElement).value}, ['storage']);
    })
    const storageLastTaskUrl = document.getElementById('store-lasttaskurl') as HTMLSelectElement;
    trySelectOption(storageLastTaskUrl, configs.tasksRememberLast ? configs.storageLastTaskUrl : StorageType.NONE);
    storageLastTaskUrl.addEventListener('change', async (event) => {
        if (!event.target) return;
        const pass = (document.getElementById('tasks-rememberlast') as HTMLInputElement).checked;
        if (!pass) {
            showStatus('error', 'Could not update value', 'First enable TASKS > Remember Last Task');
            (event.target as HTMLSelectElement).value = StorageType.NONE;
            return;
        }
        settingButtonChange({storageLastTaskUrl: (event.target as HTMLSelectElement).value}, ['storage']);
    })
}

function settingButtonChange(newConfigs: any | null, permissions: ManifestPermission[],) {
    if (newConfigs){
        permissionsRequest(permissions).then(hasPermission => {
            if (hasPermission) {
                getSettingsOrDefault().then(configs => {
                    saveData(StoredData.SETTINGS, {
                        ...configs,
                        ...newConfigs,
                    }, CONST_CONFIGS.SETTINGS_STORAGE).then(r => console.log("Saved settings: ", r))
                });
            } else {
                console.warn("Could not get permission to save settings. Please allow the extension to access these permissions.");
            }
        });
    }
}

async function permissionsRequest(permissions: ManifestPermission[]): Promise<boolean> {
    const hasPermission = await chrome.permissions.contains({
        permissions: permissions,
    });
    if (hasPermission) return true;
    return await chrome.permissions.request({
        permissions: permissions
    })
}

function trySetCheckboxValue(checkbox: HTMLElement, value: boolean) {
    try {
        (checkbox as HTMLInputElement).checked = value;
    } catch (e) {
        console.error("Could not set checkbox value. Error: ", e);
    }
}

function trySetInputValue(input: HTMLElement, value: string) {
    try {
        (input as HTMLInputElement).value = value;
    } catch (e) {
        console.error("Could not set input value. Error: ", e);
    }
}

function trySelectOption(select: HTMLElement, value: string) {
    try {
        (select as HTMLSelectElement).value = value;
    } catch (e) {
        console.error("Could not set select option. Error: ", e);
    }
}

let statusTimeout: number | null = null;

const showStatus = (type: 'error' | 'info', title: string, message: string, duration: number = 0) => {
    const modal = document.getElementById('status-modal')!;
    const titleEl = document.getElementById('modal-title')!;
    const messageEl = document.getElementById('modal-message')!;
    const circle = document.getElementById('modal-icon-circle')!;
    const iconText = document.getElementById('modal-icon-text')!;

    if (statusTimeout) {
        clearTimeout(statusTimeout);
        statusTimeout = null;
    }

    if (type === 'error') {
        circle.className = "w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600";
        iconText.innerText = "✕";
    } else {
        circle.className = "w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600";
        iconText.innerText = "i";
    }

    titleEl.innerText = title;
    messageEl.innerText = message;

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    document.getElementById('modal-close')!.onclick = () => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        if (statusTimeout) clearTimeout(statusTimeout);
    };

    if (duration > 0) {
        statusTimeout = window.setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
            statusTimeout = null;
        }, duration);
    }
};