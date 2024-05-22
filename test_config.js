// Test script for configuration interface

function testConfig() {
  // Set test values for GraphDB configuration
  document.getElementById('graphdb-url').value = 'http://test-graphdb-url.com';
  document.getElementById('graphdb-username').value = 'testuser';
  document.getElementById('graphdb-password').value = 'testpassword';
  
  // Trigger save button for GraphDB configuration
  document.getElementById('save-graphdb-config').click();
  
  // Check if GraphDB configuration is saved correctly
  const graphdbConfig = JSON.parse(localStorage.getItem('graphdbConfig'));
  console.assert(graphdbConfig.url === 'http://test-graphdb-url.com', 'GraphDB URL not saved correctly');
  console.assert(graphdbConfig.username === 'testuser', 'GraphDB username not saved correctly');
  console.assert(graphdbConfig.password === 'testpassword', 'GraphDB password not saved correctly');
  
  // Set test values for cloud file storage configuration
  document.getElementById('cloud-provider').value = 'TestProvider';
  document.getElementById('api-key').value = 'testapikey';
  document.getElementById('bucket-name').value = 'testbucket';
  
  // Trigger save button for cloud file storage configuration
  document.getElementById('save-cloud-config').click();
  
  // Check if cloud file storage configuration is saved correctly
  const cloudConfig = JSON.parse(localStorage.getItem('cloudConfig'));
  console.assert(cloudConfig.provider === 'TestProvider', 'Cloud provider not saved correctly');
  console.assert(cloudConfig.apiKey === 'testapikey', 'API key not saved correctly');
  console.assert(cloudConfig.bucketName === 'testbucket', 'Bucket name not saved correctly');
  
  console.log('All tests passed!');
}

// Run the test
testConfig();
<script src="test_config.js"></script>
<script src="test_config.js"></script>
