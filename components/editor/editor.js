document.addEventListener("DOMContentLoaded", function() {
    const editor = document.getElementById("editor");

    // Load saved content from localStorage
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    // Save content to localStorage on input
    editor.addEventListener("input", function() {
        localStorage.setItem("editorContent", editor.innerHTML);
    });
});
