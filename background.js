var engineList = {
    Google: 'http://www.google.com/search?q=%s',
      BBC: 'https://www.bbc.co.uk/search?q=%s',
    Twitter: 'https://twitter.com/search?q=%s',
    NewYorkTimes: 'https://www.nytimes.com/search?dropmab=true&query=%s'
  };
  
  var defaultEngine = 'Google';
  
  var ENGINE_LIST = 'CHROME_SEARCH_BOX_ENGINE_LIST';
  var DEFAULT_ENGINE = 'CHROME_SEARCH_BOX_DEFAULT_ENGINE';
  
  if (!localStorage.getItem(ENGINE_LIST)) {
      localStorage.setItem(ENGINE_LIST, JSON.stringify(engineList));
  } else {
      engineList = JSON.parse(localStorage.getItem(ENGINE_LIST));
  }
  
  if (!localStorage.getItem(DEFAULT_ENGINE)) {
      localStorage.setItem(DEFAULT_ENGINE, defaultEngine);
  } else {
      defaultEngine = localStorage.getItem(DEFAULT_ENGINE);
  }
  
  function navigate(url) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.update(tabs[0].id, {url: url});
      });
  }
  
  function resetDefaultSuggestion() {
      updateDefaultSuggestion('');
  }
  
  function updateDefaultSuggestion(text) {
      chrome.omnibox.setDefaultSuggestion({
          description: chrome.i18n.getMessage('omnibox_suggestion', [defaultEngine, text])
      });
  }
  
  function updateSuggestion(text, suggest) {
      var results = [];
      for(var key in engineList) {
          if (key !== defaultEngine) {
              results.push({
                  content: engineList[key].replace('%s', encodeURIComponent(text)),
                  description: chrome.i18n.getMessage('omnibox_suggestion', [key, text])
              });
          }
      }
      suggest(results);
      updateDefaultSuggestion(text);
  }
  
  chrome.omnibox.onInputStarted.addListener(function() {
      resetDefaultSuggestion();
  });
  
  chrome.omnibox.onInputCancelled.addListener(function() {
      resetDefaultSuggestion();
  });
  
  chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
      updateSuggestion(text, suggest);
  });
  
  chrome.omnibox.onInputEntered.addListener(function(text) {
      if (text) {
          if (!/^http/.test(text)) {
              text = engineList[defaultEngine].replace('%s', encodeURIComponent(text));
          }
          navigate(text);
      }
  });
  
