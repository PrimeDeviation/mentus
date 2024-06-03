document.getElementById('addSubject').addEventListener('click', function() {
  const subject = document.getElementById('subject').value;
  if (subject) {
    addSubject(subject);
  }
});

document.getElementById('sendQuery').addEventListener('click', async function() {
  const query = document.getElementById('userQuery').value;
  if (query) {
    const gpt4oResponse = await queryGPT4O(query);
    const claude3OpusResponse = await queryClaude3Opus(query);
    document.getElementById('response').innerHTML = `
      <h3>GPT-4o Response:</h3>
      <p>${gpt4oResponse.result}</p>
      <h3>Claude-3-Opus Response:</h3>
      <p>${claude3OpusResponse.result}</p>
    `;
  }
});

document.getElementById('graphdb-config-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const url = document.getElementById('graphdb-url').value;
  const username = document.getElementById('graphdb-username').value;
  const password = document.getElementById('graphdb-password').value;
  
  if (url && username && password) {
    const graphdbConfig = {
      url: url,
      username: username,
      password: password
    };
    
    localStorage.setItem('graphdbConfig', JSON.stringify(graphdbConfig));
    alert('GraphDB configuration saved successfully!');
  } else {
    alert('Please fill in all fields.');
  }
});

document.getElementById('cloud-storage-config-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const provider = document.getElementById('cloud-provider').value;
  const apiKey = document.getElementById('api-key').value;
  const bucketName = document.getElementById('bucket-name').value;

  if (provider && apiKey && bucketName) {
    const cloudStorageConfig = {
      provider: provider,
      apiKey: apiKey,
      bucketName: bucketName
    };

    localStorage.setItem('cloudStorageConfig', JSON.stringify(cloudStorageConfig));
    alert('Cloud storage configuration saved successfully!');
  } else {
    alert('Please fill in all fields.');
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
    renderKnowledgeGraph();
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
    renderKnowledgeGraph();
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
    renderKnowledgeGraph();
  } else {
    alert('Subject does not exist: ' + subject);
  }
}

function renderKnowledgeGraph() {
  const knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  const subjects = Object.keys(knowledgeGraph.subjects);
  const links = [];

  subjects.forEach(subject => {
    knowledgeGraph.subjects[subject].connections.forEach(connection => {
      links.push({ source: subject, target: connection });
    });
  });

  const width = document.getElementById('graph').clientWidth;
  const height = document.getElementById('graph').clientHeight;

  const svg = d3.select('#graph').html('').append('svg')
    .attr('width', width)
    .attr('height', height);

  const simulation = d3.forceSimulation(subjects)
    .force('link', d3.forceLink(links).id(d => d))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke-width', 2)
    .attr('stroke', '#999');

  const node = svg.append('g')
    .selectAll('circle')
    .data(subjects)
    .enter().append('circle')
    .attr('r', 5)
    .attr('fill', '#69b3a2')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('title')
    .text(d => d);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

document.addEventListener('DOMContentLoaded', renderKnowledgeGraph);

// Placeholder for API keys and endpoints
const GPT4O_API_KEY = 'your-gpt4o-api-key';
const CLAUDE3_OPUS_API_KEY = 'your-claude3-opus-api-key';
const GPT4O_ENDPOINT = 'https://api.gpt4o.com/v1/query';
const CLAUDE3_OPUS_ENDPOINT = 'https://api.claude3opus.com/v1/query';

// Function to query GPT-4o
async function queryGPT4O(query) {
  const response = await fetch(GPT4O_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GPT4O_API_KEY}`
    },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  return data;
}

// Function to query Claude-3-Opus
async function queryClaude3Opus(query) {
  const response = await fetch(CLAUDE3_OPUS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLAUDE3_OPUS_API_KEY}`
    },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  return data;
}

initializeStorage();
document.addEventListener('DOMContentLoaded', function() {
    // Add your popup initialization code here
});
