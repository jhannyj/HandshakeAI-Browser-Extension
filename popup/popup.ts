import {RuntimeMessage} from "../scripts/config.js";
import {sendRuntimeMessage} from "../scripts/util.js";

console.log("Popup opened")

sendRuntimeMessage(RuntimeMessage.SAVE_TASK_ID);
// sendRuntimeMessage(RuntimeMessage.CAPTURE_QA_FEEDBACK);