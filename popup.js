document.getElementById('addSubject').addEventListener('click', function() {
  const subject = document.getElementById('subject').value;
  if (subject) {
    alert('Added Subject: ' + subject);
  }
});
