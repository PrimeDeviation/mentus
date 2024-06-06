fetch('test_mentus_tab.html')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    console.log('HTML file loaded successfully');
    document.body.innerHTML = data;
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
