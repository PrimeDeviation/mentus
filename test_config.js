// Test script to validate configuration settings

// Function to test saving and loading GraphDB configuration
function testGraphDBConfig() {
  const graphdbConfig = {
    url: 'http://example.com',
    user: 'testuser',
    password: 'testpassword'
  };

  // Save configuration to local storage
  localStorage.setItem('graphdbConfig', JSON.stringify(graphdbConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('graphdbConfig'));

  // Validate the configuration
  if (loadedConfig.url === graphdbConfig.url &&
      loadedConfig.user === graphdbConfig.user &&
      loadedConfig.password === graphdbConfig.password) {
    console.log('GraphDB configuration test passed.');
  } else {
    console.log('GraphDB configuration test failed.');
  }
}

// Function to test saving and loading cloud file storage configuration
function testCloudConfig() {
  const cloudConfig = {
    provider: 'aws',
    apiKey: 'testapikey',
    bucketName: 'testbucket'
  };

  // Save configuration to local storage
  localStorage.setItem('cloudConfig', JSON.stringify(cloudConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('cloudConfig'));

  // Validate the configuration
  if (loadedConfig.provider === cloudConfig.provider &&
      loadedConfig.apiKey === cloudConfig.apiKey &&
      loadedConfig.bucketName === cloudConfig.bucketName) {
    console.log('Cloud file storage configuration test passed.');
  } else {
    console.log('Cloud file storage configuration test failed.');
  }
}

// Run the tests
// Test script to validate configuration settings

// Function to test saving and loading GraphDB configuration
function testGraphDBConfig() {
  const graphdbConfig = {
    url: 'http://example.com',
    user: 'testuser',
    password: 'testpassword'
  };

  // Save configuration to local storage
  localStorage.setItem('graphdbConfig', JSON.stringify(graphdbConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('graphdbConfig'));

  // Validate the configuration
  if (loadedConfig.url === graphdbConfig.url &&
      loadedConfig.user === graphdbConfig.user &&
      loadedConfig.password === graphdbConfig.password) {
    console.log('GraphDB configuration test passed.');
  } else {
    console.log('GraphDB configuration test failed.');
  }
}

// Function to test saving and loading cloud file storage configuration
function testCloudConfig() {
  const cloudConfig = {
    provider: 'aws',
    apiKey: 'testapikey',
    bucketName: 'testbucket'
  };

  // Save configuration to local storage
  localStorage.setItem('cloudConfig', JSON.stringify(cloudConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('cloudConfig'));

  // Validate the configuration
  if (loadedConfig.provider === cloudConfig.provider &&
      loadedConfig.apiKey === cloudConfig.apiKey &&
      loadedConfig.bucketName === cloudConfig.bucketName) {
    console.log('Cloud file storage configuration test passed.');
  } else {
    console.log('Cloud file storage configuration test failed.');
  }
}

// Run the tests
testGraphDBConfig();
testCloudConfig();
// Test script to validate configuration settings

// Function to test saving and loading GraphDB configuration
function testGraphDBConfig() {
  const graphdbConfig = {
    url: 'http://example.com',
    user: 'testuser',
    password: 'testpassword'
  };

  // Save configuration to local storage
  localStorage.setItem('graphdbConfig', JSON.stringify(graphdbConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('graphdbConfig'));

  // Validate the configuration
  if (loadedConfig.url === graphdbConfig.url &&
      loadedConfig.user === graphdbConfig.user &&
      loadedConfig.password === graphdbConfig.password) {
    console.log('GraphDB configuration test passed.');
  } else {
    console.log('GraphDB configuration test failed.');
  }
}

// Function to test saving and loading cloud file storage configuration
function testCloudConfig() {
  const cloudConfig = {
    provider: 'aws',
    apiKey: 'testapikey',
    bucketName: 'testbucket'
  };

  // Save configuration to local storage
  localStorage.setItem('cloudConfig', JSON.stringify(cloudConfig));

  // Load configuration from local storage
  const loadedConfig = JSON.parse(localStorage.getItem('cloudConfig'));

  // Validate the configuration
  if (loadedConfig.provider === cloudConfig.provider &&
      loadedConfig.apiKey === cloudConfig.apiKey &&
      loadedConfig.bucketName === cloudConfig.bucketName) {
    console.log('Cloud file storage configuration test passed.');
  } else {
    console.log('Cloud file storage configuration test failed.');
  }
}

// Run the tests
testGraphDBConfig();
testCloudConfig();
