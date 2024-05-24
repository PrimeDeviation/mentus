function runTests() {
  // Initialize storage
  initializeStorage();

  // Test adding a subject
  addSubject('Math');
  console.assert(getSubject('Math') !== null, 'Test Add Subject Failed');

  // Test adding an existing subject
  addSubject('Math');
  console.assert(getSubject('Math') !== null, 'Test Add Existing Subject Failed');

  // Test updating a subject
  updateSubject('Math', ['Algebra', 'Geometry']);
  console.assert(getSubject('Math').connections.length === 2, 'Test Update Subject Failed');

  // Test deleting a subject
  deleteSubject('Math');
  console.assert(getSubject('Math') === null, 'Test Delete Subject Failed');

  console.log('All tests passed!');
}

runTests();
