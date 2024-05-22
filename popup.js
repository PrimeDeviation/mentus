document.getElementById('addSubject').addEventListener('click', function() {
  const subject = document.getElementById('subject').value;
  if (subject) {
    addSubject(subject);
  }
document.getElementById('sendQuery').addEventListener('click', async function() {
  const query = document.getElementById('userQuery').value;
  if (query) {
    const gpt4oResponse = await queryGPT4O(query);
    const claude3OpusResponse = await queryClaude3Opus(query);
    document.getElementById('response').innerHTML = `
      <h3>GPT-4o Response:</h3>
      <p>${gpt4oResponse.result}</p>
    <script src="https://d3js.org/d3.v7.min.js"></script>
      <p>${claude3OpusResponse.result}</p>
    `;
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
    renderKnowledgeGraph();

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
    renderKnowledgeGraph();

function deleteSubject(subject) {
  let knowledgeGraph = JSON.parse(localStorage.getItem('knowledgeGraph'));
  if (knowledgeGraph.subjects[subject]) {
    delete knowledgeGraph.subjects[subject];
    localStorage.setItem('knowledgeGraph', JSON.stringify(knowledgeGraph));
    alert('Deleted Subject: ' + subject);
  } else {
    alert('Subject does not exist: ' + subject);
    renderKnowledgeGraph();
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

    const svg = d3.select('#graph').append('svg')
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

document.getElementById('save-graphdb-config').addEventListener('click', function() {
  const url = document.getElementById('graphdb-url').value;
  const username = document.getElementById('graphdb-username').value;
  const password = document.getElementById('graphdb-password').value;
  if (url && username && password) {
    saveGraphDBConfig(url, username, password);
  } else {
    alert('Please fill in all fields for GraphDB configuration.');
  }
});

document.getElementById('save-cloud-config').addEventListener('click', function() {
  const provider = document.getElementById('cloud-provider').value;
  const apiKey = document.getElementById('api-key').value;
  const bucketName = document.getElementById('bucket-name').value;
  if (provider && apiKey && bucketName) {
    saveCloudConfig(provider, apiKey, bucketName);
  } else {
    alert('Please fill in all fields for cloud storage configuration.');
  }
});

function saveGraphDBConfig(url, username, password) {
  const config = { url, username, password };
  localStorage.setItem('graphdbConfig', JSON.stringify(config));
  alert('GraphDB configuration saved.');
}

function saveCloudConfig(provider, apiKey, bucketName) {
  const config = { provider, apiKey, bucketName };
  localStorage.setItem('cloudConfig', JSON.stringify(config));
  alert('Cloud storage configuration saved.');
}

function loadConfig() {
  const graphdbConfig = JSON.parse(localStorage.getItem('graphdbConfig'));
  if (graphdbConfig) {
    document.getElementById('graphdb-url').value = graphdbConfig.url;
    document.getElementById('graphdb-username').value = graphdbConfig.username;
    document.getElementById('graphdb-password').value = graphdbConfig.password;
  }

  const cloudConfig = JSON.parse(localStorage.getItem('cloudConfig'));
  if (cloudConfig) {
    document.getElementById('cloud-provider').value = cloudConfig.provider;
    document.getElementById('api-key').value = cloudConfig.apiKey;
    document.getElementById('bucket-name').value = cloudConfig.bucketName;
  }
}

document.addEventListener('DOMContentLoaded', loadConfig);
