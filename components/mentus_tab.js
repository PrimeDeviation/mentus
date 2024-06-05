document.addEventListener("DOMContentLoaded", () => {
  const leftDivider = document.getElementById('divider-left');
  const rightDivider = document.getElementById('divider-right');
  let isDraggingLeft = false;
  let isDraggingRight = false;

  leftDivider.addEventListener('mousedown', () => isDraggingLeft = true);
  rightDivider.addEventListener('mousedown', () => isDraggingRight = true);
  
  document.addEventListener('mousemove', (e) => {
    if (isDraggingLeft) {
      document.getElementById('navbar').style.width = `${e.clientX}px`;
      document.getElementById('main-content').style.marginLeft = `${e.clientX + 5}px`;
    }
    if (isDraggingRight) {
      document.getElementById('chatbar').style.width = `${window.innerWidth - e.clientX}px`;
      document.getElementById('main-content').style.marginRight = `${window.innerWidth - e.clientX + 5}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDraggingLeft = false;
    isDraggingRight = false;
  });

  document.getElementById('navbar-content').innerHTML = '<object type="text/html" data="../components/navbar/navbar.html" width="100%" height="100%"></object>';
  document.getElementById('chatbar-content').innerHTML = '<object type="text/html" data="../components/chatbar/chatbar.html" width="100%" height="100%"></object>';
  document.getElementById('content-frame').innerHTML = '<object type="text/html" data="../components/graphview/graphview.html" width="100%" height="100%"></object>';
});
  document.getElementById('navbar').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
      var view = event.target.getAttribute('data-view');
      var contentFrame = document.getElementById('content-frame');
      if (view === 'graph') {
        contentFrame.setAttribute('data', '../components/graphview/graphview.html');
      } else if (view === 'documents') {
        contentFrame.setAttribute('data', '../components/documents/documents.html');
      } else if (view === 'editor') {
        contentFrame.setAttribute('data', '../components/editor/editor.html');
      }
    }
  });
