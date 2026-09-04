// DevTools entrypoint: registers DevTrace Lion panel
if (typeof chrome !== 'undefined' && chrome.devtools && chrome.devtools.panels) {
  chrome.devtools.panels.create(
    'DevTrace',
    'icon.png',
    'panel.html',
    () => {
      // Panel created successfully
    }
  );
}
