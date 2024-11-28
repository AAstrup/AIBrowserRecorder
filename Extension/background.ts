/// <reference types="chrome"/>

interface PlaywrightAction {
  name: string;
  selector?: string;
  value?: string;
}

let isRecording = false;
let actions: PlaywrightAction[] = [];

// Listen for messages from contentScript.ts
chrome.runtime.onMessage.addListener(
  (message: PlaywrightAction, sender, sendResponse) => {
    if (isRecording) {
      actions.push(message);
      chrome.storage.local.set({ actions });
    }
  }
);

// Listen for commands from popup.ts
chrome.runtime.onMessage.addListener(
  (message: { command: string; url?: string }, sender, sendResponse) => {
    if (message.command === 'startRecording') {
      isRecording = true;
      actions = [];

      // Add 'navigate' action with the current URL
      if (message.url) {
        const navigateAction: PlaywrightAction = {
          name: 'navigate',
          value: message.url,
        };
        actions.push(navigateAction);
      }

      chrome.storage.local.set({ actions });
      sendResponse({ status: 'recording_started', actions });
    } else if (message.command === 'stopRecording') {
      isRecording = false;
      chrome.storage.local.set({ actions });
      sendResponse({ status: 'recording_stopped', actions });
    } else if (message.command === 'getActions') {
      chrome.storage.local.get('actions', (result) => {
        sendResponse({ actions: result.actions || [] });
      });
      return true;
    } else if (message.command === 'clearActions') {
      actions = [];
      chrome.storage.local.set({ actions });
      sendResponse({ status: 'actions_cleared' });
    }
  }
);
