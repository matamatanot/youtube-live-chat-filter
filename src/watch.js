const storageKey = 'keywordList';

const selector = {
  getChatDom: () => document.querySelector('yt-live-chat-app'),
};

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

const getMessage = el => {
  let messageString = '';

  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      messageString += child.wholeText;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.nodeName.toLowerCase() === 'img' && typeof child.alt === 'string') {
        messageString += child.alt;
      }
    }
  }

  return messageString;
};

const checkComment = async node => {
  if (
    node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer' &&
    node.nodeName.toLowerCase() !== 'yt-live-chat-paid-message-renderer'
  ) {
    return;
  }
  const storageData = await getStorageData(storageKey);
  const keywordList = storageData[storageKey];

  const message = getMessage(node.querySelector('#message'));
  if (keywordList.some(value => message.includes(value))) {
    node.remove();
  }
};

const init = async () => {
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node));
    });
  });

  observer.observe(selector.getChatDom(), {
    childList: true,
    subtree: true,
  });
};
init();
