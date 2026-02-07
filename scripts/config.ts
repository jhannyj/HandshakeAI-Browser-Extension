export enum RuntimeMessage {
    SAVE_TASK_ID = "SAVE_TASK_ID",
    CAPTURE_QA_FEEDBACK = "CAPTURE_QA_FEEDBACK",
}

export enum State {
    FOUND_TASK_ID = "FOUND_TASK_ID",
    CAPTURED_FEEDBACK = "CAPTURED_FEEDBACK",
    FINISHED_HANDSHAKE_FORM = "FINISHED_HANDSHAKE_FORM",
}

export enum SessionData {
    TASK_ID =  "TASK_ID", // string
    LAST_QA_FEEDBACK = "LAST_QA_FEEDBACK", // [imageUrl, savedTime]
}

export const CONFIG = {
    QA_FEEDBACKS : {
        FEEDBACK_URL: "https://www.multimango.com/qa-feedback",
        DOWNLOAD_CAPTURES: true,
        OPEN_SAVE_AS_DIALOG: true,
        DEFAULT_FILE_NAME: "qa-feedback",
        USE_TIME_STAMP: true,
    },
    TASKS: {
        MULTIMANGO_TASKS_URL: "https://www.multimango.com/tasks/*",
        ALWAYS_PICK_FIRST_TASK: false,
    },
    TIMEOUT_MS: {
        PAGE_LOAD: 10000,
        SCREENSHOT: 50000,
    },
} as const;