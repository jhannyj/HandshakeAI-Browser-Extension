# HandshakeAI Workflow Helper

**HandshakeAI Workflow Helper** is a productivity-focused browser extension designed to eliminate the manual overhead of synchronizing task data between **Multimango** and **Handshake AI**.

By automating data extraction and entry, this tool ensures your QA feedback and task progress are tracked accurately and reflected in real-time across both platforms.

---

## Key Features

* **Automated Task Sync:** Bridges Multimango task data directly to Handshake AI without manual copy-pasting.
* **QA Feedback Tracker:** Remembers and monitors ratings, notifying you only when new feedback is detected.
* **Automated Screenshots:** Captures a rendering of feedback pages for your records whenever a rating update occurs.
* **Customizable Automation:** Toggle between "Run on Click" or "Run on Task Change" to fit your specific workflow.


## Installation (From GitHub)

Since this extension is being installed from a source repository rather than the Chrome Web Store (pending webstore review), follow these steps to load it into your browser:

### 1. Download the Source
* **Option A:** Clone the repository using Git:
    ```bash
    git clone https://github.com/jhannyj/HandshakeAI-Browser-Extension.git
    ```
* **Option B:** Click the green **Code** button on the GitHub page and select **Download ZIP**. Extract the files to a folder on your computer.

### 2. Prepare the Files
Ensure your project is compiled if you are using TypeScript. If the folder contains a `dist` or `build` directory, that is what you will load.
*(Note: If you are running raw files, ensure the `manifest.json` is in the root of the folder you select.)*

### 3. Load into Chrome/Edge
1.  Open your browser and navigate to `chrome://extensions` (or `edge://extensions`).
2.  Enable **Developer Mode** using the toggle in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the folder containing your extension files (the folder with the `manifest.json`).

---

## 🖱 How to Run

1.  **Open the Dashboard:** Click the extension icon in your toolbar to open the neon-dark control panel.
2.  **Manual Submission:** Navigate to a task page and click the big **SUBMIT** button to trigger an immediate sync.
3.  **Automated Workflow:**
    * Expand the **Configuration** section.
    * Enable **"Run on Task Change"** to let the extension detect new tasks automatically.
    * Enable **"Screenshot"** under QA Feedbacks to automatically save records of your ratings.
4.  **Monitor Status:** A status modal will appear on the page once the data transfer is complete, providing instant feedback on whether the sync succeeded or failed.

---

## ⚠️ Disclaimer

> **This extension is an independent tool and is not officially associated with, endorsed by, or affiliated with Handshake, Handshake AI, or Multimango.** Use of this tool is at your own risk.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.