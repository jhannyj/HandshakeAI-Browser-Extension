import {captureTab, downloadFile, saveDataToSession, findTabs, extractTaskId} from "./util.js";
import { CONFIG, State, SessionData } from "./config.js";

export async function saveTaskId(): Promise<string | null> {
    const tabs = await findTabs({ url: CONFIG.TASKS.MULTIMANGO_TASKS_URL });
   if (!tabs) return null;
   let taskTab: chrome.tabs.Tab = tabs[0];

   function getRankedTaskIdFromTab(tab: chrome.tabs.Tab): [string | null, number] {
       if (tab.id && tab.url) {
           const score = tab.active ? 1 : 0;
           return [extractTaskId(tab.url), score];
       }
       return [null, -1];
   }

   let taskId: string;
   if (!CONFIG.TASKS.ALWAYS_PICK_FIRST_TASK) {
       const ids = tabs.map(getRankedTaskIdFromTab).filter(id => id[0] !== null).toSorted((a, b) => b[1] - a[1]);
       console.info("Picking from ranked task ids - ALWAYS_PICK_FIRST_TASK=false: ", ids)
       taskId = ids[0][0]!;
   } else {
       console.info("Picking first task tab: ", taskTab.url);
       if (!taskTab.url) {
           console.error("First task tab has no url. Cannot extract task id.");
           return null;
       }
       taskId = extractTaskId(taskTab.url)!;
   }

   console.info("Found task id: ", taskId);
   if (!await saveDataToSession(SessionData.TASK_ID, taskId)) return null;
    if (!await saveDataToSession(State.FOUND_TASK_ID, true)) return null;
   return null;
}

export async function captureAndSaveQAFeedback(): Promise<[string | null, number | null]> {
    const dataUrl = await captureTab(CONFIG.QA_FEEDBACKS.FEEDBACK_URL);
    if (!await saveDataToSession(SessionData.LAST_QA_FEEDBACK, [dataUrl, Date.now().toString()])) return [null, null];
    if (!await saveDataToSession(State.CAPTURED_FEEDBACK, true)) return [null, null];

    if (dataUrl && CONFIG.QA_FEEDBACKS.DOWNLOAD_CAPTURES) {
        const downloadId = await downloadFile(dataUrl, CONFIG.QA_FEEDBACKS.DEFAULT_FILE_NAME, CONFIG.QA_FEEDBACKS.USE_TIME_STAMP, CONFIG.QA_FEEDBACKS.OPEN_SAVE_AS_DIALOG);
        return [dataUrl, downloadId]
    }

    return [dataUrl, null]
}