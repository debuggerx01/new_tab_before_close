class TabCount {
  normalTabCount = 0;
  chromeTabCount = 0;
  tabs = [];
}

let justDragged = false;

const handleTabsChange = async () => {
  let tabs;
  try {
    tabs = await chrome.tabs.query({});
  } catch (error) {
    if (error.message.includes('dragging')) {
      debounce(handleTabsChange, 100)();
      justDragged = true;
    }
  }

  if (tabs) {
    if (justDragged) {
      justDragged = false;
      return debounce(handleTabsChange, 300)();
    }
  } else return;
  justDragged = false;

  const tabsCount = [];
  tabs.forEach(t => {
    if (!tabsCount[t.windowId]) {
      tabsCount[t.windowId] = new TabCount();
    }
    if (t.url.startsWith('chrome://')) {
      tabsCount[t.windowId].chromeTabCount++;
    } else {
      tabsCount[t.windowId].normalTabCount++;
    }
    tabsCount[t.windowId].tabs[t.index] = t;
  });

  tabsCount.forEach(tabCount => {
    if (tabCount.normalTabCount === 1 && tabCount.chromeTabCount === 0) {
      chrome.tabs.create({
        pinned: true,
        index: 0,
        active: false,
        windowId: tabCount.tabs[0].windowId,
      });
    } else if (tabCount.normalTabCount === 0 && tabCount.chromeTabCount === 1 && tabCount.tabs[0].pinned) {
      chrome.tabs.update(tabCount.tabs[0].id, {
        pinned: false,
      });
    } else if (tabCount.tabs[0].pinned
      && (tabCount.normalTabCount > 1
        || tabCount.chromeTabCount > 1
        || (tabCount.normalTabCount === 0 && tabCount.tabs[1].url.startsWith('chrome://'))
      )
    ) {
      chrome.tabs.remove(tabCount.tabs[0].id);
    }
  });
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

[
  chrome.tabs.onRemoved,
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.windows.onCreated,
  chrome.windows.onRemoved,
].forEach((evt) => {
  evt.addListener(debounce(handleTabsChange, 100));
});
