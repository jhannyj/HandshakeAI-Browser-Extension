import {CONST_CONFIGS, ContentMessage, Ratings} from "../configs";
import html2canvas from 'html2canvas';

console.log("Handshake AI Util Extension - MULTIMANGO_TASK -  loaded into page");

function readRatingsPreview(): [number, number] | null {
    const avgRatingElement = document.querySelector(CONST_CONFIGS.QA_FEEDBACKS.RATINGS.AVG_RATING_SELECTOR);
    if (!avgRatingElement) {
        console.error("Could not find QA score in ratings preview");
        return null;
    }
    let avgRating: number;
    try {
        avgRating = Number(avgRatingElement.textContent);
    }
    catch (e) {
        console.error("Could not parse average rating. Error: ", e);
        return null;
    }

    const numReviewsElement = document.querySelector(CONST_CONFIGS.QA_FEEDBACKS.RATINGS.NUM_REVIEWS_SELECTOR);
    if (!numReviewsElement) {
        console.error("Could not find number of reviews in ratings preview");
        return null;
    }
    const fullReviewText = numReviewsElement.textContent.trim();
    let numReview: number;
    try {
        numReview = Number(fullReviewText.split(' ')[0]);
    } catch (e) {
        console.error("Could not parse number of reviews. Error: ", e);
        console.log("Full review text: ", fullReviewText);
        console.log("Num portion: ", fullReviewText.split(' ')[0])
        return null;
    }
    if (!numReview) {
        console.error("Could not parse number of reviews");
        return null
    }

    console.log("Avg rating: ", avgRating, "Num reviews: ", numReview);
    return [avgRating, numReview];
}

function readFullRatings(): Ratings | null {
    const ratingElements = document.querySelectorAll(CONST_CONFIGS.QA_FEEDBACKS.RATINGS.FULL_QUERY_SELECTOR);
    if (ratingElements.length < 4) {
        console.error("Not enough elements found for ratings. Expected 4, found: ", ratingElements.length);
        return null;
    }
    let ratings: number[];
    try {
        ratings = [...ratingElements].map(el => Number(el.textContent));
    } catch (e) {
        console.error("Could not parse ratings. Error: ", e);
        return null;
    }
    if (ratings.some(isNaN)) {
        console.error("Found non-numeric ratings. Ratings: ", ratings);
        return null;
    }
    const avgRatingElement = document.querySelector('.text-emerald-700.font-bold');
    if (!avgRatingElement) {
        console.error("Could not find average rating element. Ratings: ", ratings);
        return null;
    }
    let avgRating: number;
    try {
        avgRating = Number(avgRatingElement.textContent);
    }
    catch (e) {
        console.error("Could not parse average rating. Error: ", e);
        return null;
    }
    return {average: avgRating, exceptional: ratings[0], meetsExpectations: ratings[1], someIssues: ratings[2], majorIssues: ratings[3]};
}

async function screenshotQAFeedback(): Promise<string | null> {
    try {
        const canvas: HTMLCanvasElement = await html2canvas(document.body, { useCORS: true, logging: false });
        return canvas.toDataURL("image/png");
    } catch (e) {
        console.error("Error taking screenshot of QA feedback page. Error: ", e);
        return null;
    }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.info("MULTIMANGO TASKS content script starting: ", message.action);
    const currentUrl = window.location.href;
    if (message.action === ContentMessage.READ_RATINGS_PREVIEW) {
        if (!currentUrl.trim().startsWith(CONST_CONFIGS.TASKS.MULTIMANGO_PREFIX)) {
            console.error("Current url is not a multimango task url. Current url: ", currentUrl);
            sendResponse({ status: "Failed", data: null });
            return true;
        }
        const data = readRatingsPreview();
        sendResponse({ status: data ? "Success": "Failed", data: data });
        return true;
    } else if (message.action === ContentMessage.READ_FULL_RATINGS) {
        if (!currentUrl.trim().startsWith(CONST_CONFIGS.QA_FEEDBACKS.URL)) {
            console.error("Current url is not a QA feedbacks page. Current url: ", currentUrl);
            sendResponse({ status: "Failed", data: null });
            return true;
        }
        const ratings = readFullRatings();
        sendResponse({ status: ratings ? "Success" : "Failed", data: ratings});
        return true;
    } else if(message.action == ContentMessage.SCREENSHOT_QA_FEEDBACK) {
        if (currentUrl.trim() !== CONST_CONFIGS.QA_FEEDBACKS.URL) {
            console.error("Current url is not a QA feedbacks page. Current url: ", currentUrl);
            sendResponse({ status: "Failed", data: null });
            return true;
        }
        screenshotQAFeedback().then(data => sendResponse({ status: data ? "Success": "Failed", data: data }));
        return true;
    }
    console.info("MULTIMANGO TASKS content script finished: ", message.action);
});