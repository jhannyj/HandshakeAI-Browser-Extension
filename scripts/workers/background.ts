import { RuntimeMessage } from "../config.js";
import { saveTaskId, captureAndSaveQAFeedback } from "../actions.js";

chrome.runtime.onMessage.addListener((message) => {
    console.info("Background script starting: ", message.action);
    if (message.action == RuntimeMessage.SAVE_TASK_ID) {
        saveTaskId().catch((err) => {
            console.error("Background script failed: ", message.action);
            console.error(err);
        })
        return true;
    } else if (message.action === RuntimeMessage.CAPTURE_QA_FEEDBACK) {
        captureAndSaveQAFeedback()
            .catch((err) => {
                console.error("Background script failed: ", message.action);
                console.error(err);
            });
        return true;
    }
    console.info("Background script finished: ", message.action);
});