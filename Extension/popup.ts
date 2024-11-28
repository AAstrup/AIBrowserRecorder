/// <reference types="chrome"/>

const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const replayBtn = document.getElementById('replayBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const actionsList = document.getElementById('actionsList') as HTMLUListElement;

// Function to update the actions list display
function updateActionsList(actions: PlaywrightAction[]) {
  actionsList.innerHTML = ''; // Clear the list
  actions.forEach((action, index) => {
    const listItem = document.createElement('li');
    let description = '';
    switch (action.name) {
      case 'navigate':
        description = `Navigate to ${action.value}`;
        break;
      case 'click':
        description = `Click on ${action.selector}`;
        break;
      case 'fill':
        description = `Fill ${action.selector} with "${action.value}"`;
        break;
      default:
        description = `${action.name}`;
    }
    listItem.textContent = `${index + 1}. ${description}`;
    actionsList.appendChild(listItem);
  });
}

// Retrieve and display actions when the popup is opened
chrome.runtime.sendMessage({ command: 'getActions' }, (response: { actions: PlaywrightAction[] }) => {
  const actions = response.actions;
  updateActionsList(actions);
});

// Event listener for the record button
recordBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = currentTab.url || '';

    chrome.runtime.sendMessage({ command: 'startRecording', url }, (response: any) => {
      if (response.status === 'recording_started') {
        recordBtn.disabled = true;
        stopBtn.disabled = false;

        // Update the actions list to show the 'navigate' action
        updateActionsList(response.actions);
      }
    });
  });
});

// Event listener for the stop button
stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'stopRecording' }, (response: any) => {
    if (response.status === 'recording_stopped') {
      recordBtn.disabled = false;
      stopBtn.disabled = true;
      updateActionsList(response.actions);
    }
  });
});

// Event listener for the replay button
replayBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'getActions' }, (response: { actions: PlaywrightAction[] }) => {
    const actions = response.actions;

    fetch('http://localhost:3000/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions }),
    })
      .then((res) => res.text())
      .then((data) => alert(data))
      .catch((error) => alert('Error: ' + error.message));
  });
});

// Event listener for the clear actions button
clearBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'clearActions' }, () => {
    actionsList.innerHTML = '';
    alert('Actions have been cleared.');
  });
});
