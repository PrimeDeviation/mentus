document.addEventListener("DOMContentLoaded", () => {
  const settingsTab = document.getElementById('settings');
  if (settingsTab.style.display === 'block') {
    console.log('Test passed: Settings tab is displayed by default.');
  } else {
    console.log('Test failed: Settings tab is not displayed by default.');
  }
});
