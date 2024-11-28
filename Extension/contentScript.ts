/// <reference types="chrome"/>

interface PlaywrightAction {
  name: string;
  selector?: string;
  value?: string;
  key?: string;
}

document.addEventListener('click', (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const selector = getSelector(target);
  const action: PlaywrightAction = { name: 'click', selector };
  chrome.runtime.sendMessage(action);
});

document.addEventListener('input', (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selector = getSelector(target);
  const action: PlaywrightAction = {
    name: 'fill',
    selector,
    value: target.value,
  };
  chrome.runtime.sendMessage(action);
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const keysToRecord = ['Enter', 'Tab', 'Escape'];
  if (keysToRecord.includes(event.key)) {
    const target = event.target as HTMLElement;
    const selector = getSelector(target);
    const action: PlaywrightAction = {
      name: 'press',
      selector,
      key: event.key,
    };
    chrome.runtime.sendMessage(action);
  }
});

// Function to generate a unique selector for the element
function getSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }
  let selector = element.tagName.toLowerCase();
  if (element.className) {
    selector += '.' + element.className.trim().replace(/\s+/g, '.');
  }
  return selector;
}
