document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('settings-form');

    // Load saved settings
    chrome.storage.sync.get(['enableFeature', 'preference'], function(data) {
        document.getElementById('enable-feature').checked = data.enableFeature || false;
        document.getElementById('preference').value = data.preference || '';
    });

    // Save settings on form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const enableFeature = document.getElementById('enable-feature').checked;
        const preference = document.getElementById('preference').value;

        chrome.storage.sync.set({
            enableFeature: enableFeature,
            preference: preference
        }, function() {
            alert('Settings saved');
        });
    });
});
