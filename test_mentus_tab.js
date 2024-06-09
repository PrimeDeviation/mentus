document.addEventListener("DOMContentLoaded", () => {
  const settingsTab = document.getElementById('settings');
  if (settingsTab.style.display === 'block') {
    console.log('Test passed: Settings tab is displayed by default.');
  } else {
    console.log('Test failed: Settings tab is not displayed by default.');
  }

  // Test switching tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.click();
    const tabName = button.getAttribute('data-tab');
    const tabContent = document.getElementById(tabName);
    if (tabContent.classList.contains('active')) {
      console.log(`Test passed: ${tabName} tab is displayed correctly.`);
    } else {
      console.log(`Test failed: ${tabName} tab is not displayed correctly.`);
    }
  });
});
