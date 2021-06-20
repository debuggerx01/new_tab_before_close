window.onbeforeunload = function (e) {
  chrome.runtime.sendMessage({
    info: 'closeTab',
  });
}