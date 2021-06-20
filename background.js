chrome.runtime.onStartup.addListener(async () => {
  let isLast = false;
  chrome.tabs.onRemoved.addListener(() => {
    chrome.tabs.query({}, function (tabs) {
      isLast = tabs.length === 1;
      console.dir(tabs);
    });
  });
  console.info('init');
  chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
    console.info('on');
    if (msg.info === 'closeTab' && isLast) {
      chrome.tabs.create({ url: 'chrome://newtab' });
      console.info('do');
    }
  });
});
