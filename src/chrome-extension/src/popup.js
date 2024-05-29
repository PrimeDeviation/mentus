document.addEventListener('DOMContentLoaded', function() {
    // Handle tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to the clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${button.id}-content`).classList.add('active');
        });
    });

    // Handle expand/collapse functionality
    const expandCollapseButton = document.getElementById('expand-collapse-button');
    const popupContainer = document.getElementById('popup-container');

    expandCollapseButton.addEventListener('click', () => {
        if (popupContainer.classList.contains('compact')) {
            popupContainer.classList.remove('compact');
            popupContainer.classList.add('expanded');
            expandCollapseButton.textContent = 'Collapse';
        } else {
            popupContainer.classList.remove('expanded');
            popupContainer.classList.add('compact');
            expandCollapseButton.textContent = 'Expand';
        }
    });
});
