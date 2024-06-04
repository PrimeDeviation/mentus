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
