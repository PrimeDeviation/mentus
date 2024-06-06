document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('chatbar-content').innerHTML = '<object type="text/html" data="../components/chatbar/chatbar.html" width="100%" height="100%"></object>';
  document.getElementById('graph').innerHTML = '<object type="text/html" data="../components/tabs/graphview/graphview.html" width="100%" height="100%"></object>';
  document.getElementById('docs').innerHTML = '<object type="text/html" data="../components/tabs/documents/documents.html" width="100%" height="100%"></object>';
  document.getElementById('editor').innerHTML = '<object type="text/html" data="../components/tabs/editor/editor.html" width="100%" height="100%"></object>';
  document.getElementById('settings').innerHTML = '<object type="text/html" data="../components/tabs/settings/settings.html" width="100%" height="100%"></object>';
});

function showTab(tabName) {
  const tabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.display = 'none';
  }
  document.getElementById(tabName).style.display = 'block';
}
