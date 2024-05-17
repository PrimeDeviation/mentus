document.getElementById('addSubject').addEventListener('click', function() {
  const subject = document.getElementById('subject').value;
  if (subject) {
    addSubject(subject);
  }
});
function initializeStorage() {
  if (!localStorage.getItem('knowledgeGraph')) {
    localStorage.setItem('knowledgeGraph', JSON.stringify({ subjects: {} }));
  }
}

function addSubject(subject) {
  let knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  if (!knowledgeGraph.subjects[subject]) {
    knowledgeGraph.subjects[subject] = { connections: [] };
    localStorage.setItem('knowledgeGraph', JSON.stringify(knowledgeGraph));
    alert('Added Subject: ' + subject);
  } else {
    alert('Subject already exists: ' + subject);
  }
}

function getSubject(subject) {
  let knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  return knowledgeGraph.subjects[subject] || null;
}

function updateSubject(subject, newConnections) {
  let knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  if (knowledgeGraph.subjects[subject]) {
    knowledgeGraph.subjects[subject].connections = newConnections;
    localStorage.setItem('knowledgeGraph', JSON.stringify(knowledgeGraph));
    alert('Updated Subject: ' + subject);
  } else {
    alert('Subject does not exist: ' + subject);
  }
}

function deleteSubject(subject) {
  let knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  if (knowledgeGraph.subjects[subject]) {
    delete knowledgeGraph.subjects[subject];
    localStorage.setItem('knowledgeGraph', JSON.stringify(knowledgeGraph));
    alert('Deleted Subject: ' + subject);
  } else {
    alert('Subject does not exist: ' + subject);
  }
}

initializeStorage();
