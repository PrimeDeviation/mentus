document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('graph').innerHTML = '<object type="text/html" data="./graphview/graphview.html" width="100%" height="100%"></object>';
  document.getElementById('docs').innerHTML = '<object type="text/html" data="./documents/documents.html" width="100%" height="100%"></object>';
  document.getElementById('editor').innerHTML = '<object type="text/html" data="./editor/editor.html" width="100%" height="100%"></object>';
  document.getElementById('settings').innerHTML = '<object type="text/html" data="./settings/settings.html" width="100%" height="100%"></object>';

  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const tabName = event.target.getAttribute('data-tab');
      showTab(tabName);
    });
  });
  showTab('settings');
  function showTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }
    const activeTab = document.getElementById(tabName);
    activeTab.classList.add('active');
    activeTab.style.height = '100vh';
    activeTab.style.width = '100%';
  }

})