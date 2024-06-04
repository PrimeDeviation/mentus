document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('graph-view').addEventListener('click', function() {
        loadSection('graphview');
    });

    document.getElementById('documents').addEventListener('click', function() {
        loadSection('documents');
    });

    document.getElementById('editor').addEventListener('click', function() {
        console.log("Editor section loaded");
        loadSection('editor');

    document.getElementById('settings').addEventListener('click', function() {
        loadSection('settings');
    });

    function loadSection(section) {
        const sections = ['graphview', 'documents', 'editor', 'settings'];
        sections.forEach(function(sec) {
            document.getElementById(sec).style.display = 'none';
        });
        document.getElementById(section).style.display = 'block';
    }
});
