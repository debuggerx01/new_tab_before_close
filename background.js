chrome.tabs.onRemoved.addListener(async () => {
  chrome.tabs.query({}, async (tabs) => {
    chrome.storage.local.set({isLast: tabs.length === 1});
  });
});

console.info('init');

chrome.runtime.onMessage.addListener(async (msg) => {
  console.info('on');
  if (msg.info === 'closeTab') {
    console.info('do');
    chrome.storage.local.get(['isLast'], async (result) => {
      if (result.isLast) {
        chrome.tabs.create({ url: 'chrome://newtab' });
      }
    });
  }
});
