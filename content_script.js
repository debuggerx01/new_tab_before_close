window.onbeforeunload = () => {
  chrome.runtime.sendMessage({
    info: 'closeTab',
  });
};