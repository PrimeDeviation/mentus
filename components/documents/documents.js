document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('upload-button');
    const fileUpload = document.getElementById('file-upload');
    const documentsList = document.getElementById('documents-list');

    uploadButton.addEventListener('click', () => {
        const files = fileUpload.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const listItem = document.createElement('div');
                listItem.className = 'document-item';
                listItem.textContent = file.name;
                documentsList.appendChild(listItem);
            }
        }
    });
});
