const handleTabsChange = async () => {
  const tabs = await chrome.tabs.query({});
  let normalTabCount = 0;
  let chromeTabCount = 0;
  tabs.forEach(t => {
    if (t.url.startsWith('chrome://')) {
      chromeTabCount++;
    } else {
      normalTabCount++;
    }
  });

  if (normalTabCount === 1 && chromeTabCount === 0) {
    chrome.tabs.create({ pinned: true, index: 0, active: false });
  } else if (normalTabCount === 0 && chromeTabCount === 1 && tabs[0].pinned) {
    chrome.tabs.update(tabs[0].id, { pinned: false });
  } else if (tabs[0].pinned && (normalTabCount > 1 || chromeTabCount > 1 || (normalTabCount === 0 && tabs[1].url.startsWith('chrome://')))) {
    chrome.tabs.remove(tabs[0].id);
  }
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

[chrome.tabs.onRemoved, chrome.tabs.onCreated, chrome.tabs.onUpdated].forEach((evt) => {
  evt.addListener(debounce(handleTabsChange, 100));
});
