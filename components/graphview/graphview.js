if (typeof d3 === 'undefined') {
    console.error('D3 library is not loaded. Please check the script tag in mentus_tab.html');
}

const nodeMap = new Map();
let graphData = { nodes: [], links: [] };
let isDataFetched = false;
let isFetching = false;

let fileLinkCache = new Map();
let lastCacheUpdate = null;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

class Node {
    constructor(id, label, type, parent = null) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.parent = parent;
        this.links = new Set();
        this.tags = new Set();
    }

    addLink(targetId) {
        this.links.add(targetId);
    }

    addTag(tag) {
        this.tags.add(tag);
    }
}

// Add this function near the top of the file
function normalizeFilePath(path) {
    // Remove leading and trailing whitespace, and normalize multiple slashes to single slashes
    path = path.trim().replace(/\/+/g, '/');
    
    // Remove any '.md' extension if present, we'll add it back later
    path = path.replace(/\.md$/, '');

    // Ensure the path ends with '.md'
    if (!path.endsWith('.md')) {
        path += '.md';
    }
    
    console.log(`Normalized path: ${path}`);
    return path;
}

// Update the getObsidianLinks function to parse links from the content
async function getObsidianLinks(filePath, apiKey, baseUrl) {
    const currentTime = Date.now();
    const normalizedPath = normalizeFilePath(filePath);
    
    if (fileLinkCache.has(normalizedPath) && lastCacheUpdate && (currentTime - lastCacheUpdate < CACHE_EXPIRY_TIME)) {
        console.log(`Using cached links for ${normalizedPath}`);
        return fileLinkCache.get(normalizedPath);
    }

    const encodedFilePath = encodeURIComponent(normalizedPath);
    const url = `${baseUrl}/vault/${encodedFilePath}`;
    
    try {
        console.log(`Fetching content for ${normalizedPath} from ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/vnd.olrapi.note+json'
            }
        });
        
        if (response.status === 404) {
            console.warn(`File not found: ${normalizedPath}`);
            return []; // Return an empty array for non-existent files
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Parsed JSON data for ${normalizedPath}:`, data);

        // Parse links from the content
        const content = data.content || '';
        const links = parseLinksFromContent(content);
        console.log(`Processed ${links.length} links for ${normalizedPath}`);
        
        fileLinkCache.set(normalizedPath, links);
        lastCacheUpdate = currentTime;
        
        return links;
    } catch (error) {
        console.error(`Error fetching links for ${normalizedPath}:`, error);
        return []; // Return an empty array in case of any error
    }
}

// Update the parseLinksFromContent function
function parseLinksFromContent(content) {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const links = [];
    let match;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
        const link = { path: match[1].split('|')[0].trim() };
        links.push(link);
        console.log(`Found link in content: ${JSON.stringify(link)}`);
    }

    console.log(`Total links found in content: ${links.length}`);
    return links;
}

// Update the populateGraphData function
async function populateGraphData() {
    if (isFetching) return;
    isFetching = true;
    console.log('Populating graph data');

    try {
        const obsidianApiKey = await window.settingsModule.getSetting('obsidian-api-key');
        const obsidianEndpoint = await window.settingsModule.getSetting('obsidian-endpoint');

        if (!obsidianApiKey || !obsidianEndpoint) {
            throw new Error('Obsidian API key or endpoint not set');
        }

        // Fetch Obsidian data
        const vaultUrl = `${obsidianEndpoint}/vault/`;
        let allFiles = await fetchAllFiles(vaultUrl, obsidianApiKey);
        console.log(`Fetched ${allFiles.length} files from Obsidian`);

        // First pass: Create all nodes
        for (const file of allFiles) {
            if (file.endsWith('.md')) {
                const normalizedFile = normalizeFilePath(file);
                const nodeName = normalizedFile.split('/').pop().replace('.md', '');
                if (!nodeMap.has(nodeName)) {
                    nodeMap.set(nodeName, new Node(normalizedFile, nodeName, 'file'));
                }
            }
        }

        console.log(`Created ${nodeMap.size} nodes`);

        // Second pass: Process links
        for (const file of allFiles) {
            if (file.endsWith('.md')) {
                const normalizedFile = normalizeFilePath(file);
                const nodeName = normalizedFile.split('/').pop().replace('.md', '');
                const node = nodeMap.get(nodeName);
                const links = await getObsidianLinks(file, obsidianApiKey, obsidianEndpoint);
                console.log(`Processing ${links.length} links for ${file}:`);
                links.forEach(link => {
                    if (link && link.path) {
                        const targetPath = normalizeFilePath(link.path);
                        const targetName = targetPath.split('/').pop().replace('.md', '');
                        let targetNode = nodeMap.get(targetName);
                        if (!targetNode) {
                            targetNode = new Node(targetPath, targetName, 'file');
                            nodeMap.set(targetName, targetNode);
                            console.log(`Created new node for ${targetName}`);
                        }
                        node.addLink(targetName);
                        console.log(`Added link from ${nodeName} to ${targetName}`);
                    } else {
                        console.warn(`Invalid link found in ${normalizedFile}:`, link);
                    }
                });
            }
        }

        // Create initial graph data from Obsidian
        await createGraphData();

        isDataFetched = true;
        initializeGraph();
    } catch (error) {
        console.error('Error populating graph data:', error);
        updateLoadingMessage(`Error: ${error.message}. Please check your settings.`);
    } finally {
        isFetching = false;
    }
}

async function buildGraphData() {
    showLoadingMessage();
    await populateGraphData();
}

async function fetchAllFiles(vaultUrl, apiKey, path = '') {
    const encodedPath = path ? encodeURIComponent(path) : '';
    const url = `${vaultUrl}${encodedPath}?links=true`;
    console.log(`Fetching files from: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Path not found: ${url}. Skipping this folder.`);
                return [];
            }
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.files || !Array.isArray(data.files)) {
            console.warn('Unexpected data structure:', data);
            return [];
        }
        
        let files = data.files.filter(f => f.endsWith('.md'));
        let subfolders = data.files.filter(f => f.endsWith('/'));
        
        console.log(`Found ${files.length} files and ${subfolders.length} subfolders in ${path || 'root'}`);
        
        let allFiles = files.map(file => path ? `${path}${file}` : file);
        
        for (let folder of subfolders) {
            const folderPath = path ? `${path}${folder}` : folder;
            const subfolderFiles = await fetchAllFiles(vaultUrl, apiKey, folderPath);
            allFiles = allFiles.concat(subfolderFiles);
        }
        
        return allFiles;
    } catch (error) {
        console.error(`Error fetching files from ${url}:`, error);
        return [];
    }
}

// Add the missing generateNodeLabel function
async function generateNodeLabel(node) {
    // For now, just return the node's label
    return node.label;
}

// Add the missing generateEdgeLabel function
async function generateEdgeLabel(sourceNode, targetNode) {
    // For now, just return a default label
    return "links to";
}

// Update the createGraphData function
async function createGraphData() {
    const nodeTable = new Map();
    const linkTable = new Map();

    console.log('Creating graph data from nodeMap:', nodeMap);

    // Create all nodes
    for (const [nodeName, node] of nodeMap.entries()) {
        const label = await generateNodeLabel(node);
        nodeTable.set(nodeName, {
            id: nodeName,
            label: label,
            type: node.type,
            tags: Array.from(node.tags)
        });
    }

    console.log('Node table created:', nodeTable);

    // Create all links
    for (const [nodeName, node] of nodeMap.entries()) {
        console.log(`Processing links for ${nodeName}:`, node.links);
        for (const targetName of node.links) {
            if (nodeTable.has(targetName)) {
                const linkId = `${nodeName}-->${targetName}`;
                if (!linkTable.has(linkId)) {
                    const label = await generateEdgeLabel(
                        nodeTable.get(nodeName),
                        nodeTable.get(targetName)
                    );
                    linkTable.set(linkId, {
                        source: nodeName,
                        target: targetName,
                        label: label
                    });
                    console.log(`Created link: ${nodeName} -> ${targetName} (${label})`);
                }
            } else {
                console.warn(`Link target not found: ${targetName} (from ${nodeName})`);
            }
        }
    }

    graphData.nodes = Array.from(nodeTable.values());
    graphData.links = Array.from(linkTable.values());

    console.log('Graph data created.');
    console.log('Nodes:', graphData.nodes.length, graphData.nodes);
    console.log('Links:', graphData.links.length, graphData.links);
    
    if (graphData.links.length === 0) {
        console.warn('No links found in graph data. Check link creation process.');
    } else {
        console.log('Sample links:', graphData.links.slice(0, 5));
    }
}

// Declare simulation as a global variable (only once)
let simulation;

function initializeGraph() {
    console.log("Initializing graph");
    console.log("D3 version:", d3.version);
    const graphContainer = document.getElementById('graph-container');
    if (!graphContainer) {
        console.error('Graph container not found');
        return;
    }

    const width = graphContainer.clientWidth || 800;
    const height = graphContainer.clientHeight || 600;

    console.log("Graph container dimensions:", width, height);

    if (graphData.nodes.length === 0) {
        console.warn("No nodes to display in the graph");
        graphContainer.innerHTML = '<div class="loading-message">No data to display in the graph.</div>';
        return;
    }

    graphContainer.innerHTML = '';
    const svg = d3.select(graphContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "var(--bg-color)");

    const g = svg.append("g");

    // Adjust these values to change the spacing and behavior of nodes
    simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100).strength(0.1))
        .force("charge", d3.forceManyBody().strength(-30))
        .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1)) // Attractive force
        .force("collision", d3.forceCollide().radius(d => d.size || 5));

    const linkOpacity = 0.6; // Increased default opacity
    const linkWidth = 2; // Increased default width
    const nodeSize = 6; // Default node size

    console.log('Graph data links:', graphData.links);
    debugger; // This will pause execution in dev tools

    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("stroke", "var(--link-color)")
        .attr("stroke-opacity", linkOpacity)
        .attr("stroke-width", linkWidth);

    link.append("title")
        .text(d => d.label);

    console.log('Links created:', link.size(), link.nodes());

    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graphData.nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", d => d.size || nodeSize)
        .attr("fill", d => d.type === 'folder' ? "var(--folder-color)" : "var(--node-color)");

    node.append("text")
        .text(d => d.label)
        .attr('x', d => (d.size || nodeSize) + 3)
        .attr('y', 3)
        .style("font-size", d => `${(d.size || nodeSize) * 3.2}px`) // Doubled again from 1.6 to 3.2
        .style("fill", "var(--text-color)");

    node.append("title")
        .text(d => {
            let tooltip = d.label;
            if (d.tags && d.tags.length > 0) {
                tooltip += "\nTags: " + d.tags.join(", ");
            }
            return tooltip;
        });

    simulation
        .nodes(graphData.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graphData.links);

    // Add these variables at the top of your file, outside any function
    let lastLogTime = 0;
    let tickCounter = 0;

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Throttled logging with additional counter
        tickCounter++;
        if (Date.now() - lastLogTime > 5000 && tickCounter % 100 === 0) {
            console.log('Graph ticked (100th tick within 5-second interval)');
            if (link.data()[0]) {
                console.log('Sample link coordinates:', {
                    source: { x: link.data()[0].source.x, y: link.data()[0].source.y },
                    target: { x: link.data()[0].target.x, y: link.data()[0].target.y }
                });
            }
            lastLogTime = Date.now();
        }
    }

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

    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    fitGraphToContainer(g, zoom);

    // Create graph controls
    const controlPanel = d3.select(graphContainer).append("div")
        .attr("id", "graph-controls")
        .style("position", "absolute")
        .style("top", "10px")
        .style("left", "10px")
        .style("background-color", "var(--control-bg-color)")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("color", "var(--text-color)");

    controlPanel.append("div")
        .html(`
            <label for="center-force">Center Force: <span id="center-force-value">0.1</span></label>
            <input type="range" id="center-force" min="0" max="1" step="0.01" value="0.1">
            <br>
            <label for="repel-force">Repel Force: <span id="repel-force-value">-30</span></label>
            <input type="range" id="repel-force" min="-100" max="0" step="1" value="-30">
            <br>
            <label for="link-force">Link Force: <span id="link-force-value">0.1</span></label>
            <input type="range" id="link-force" min="0" max="1" step="0.01" value="0.1">
            <br>
            <label for="link-distance">Link Distance: <span id="link-distance-value">250</span></label>
            <input type="range" id="link-distance" min="10" max="300" step="10" value="250">
            <br>
            <label for="link-opacity">Link Opacity: <span id="link-opacity-value">${linkOpacity}</span></label>
            <input type="range" id="link-opacity" min="0" max="1" step="0.1" value="${linkOpacity}">
            <br>
            <label for="link-width">Link Width: <span id="link-width-value">${linkWidth}</span></label>
            <input type="range" id="link-width" min="1" max="10" step="1" value="${linkWidth}">
            <br>
            <label for="node-size">Node Size: <span id="node-size-value">${nodeSize}</span></label>
            <input type="range" id="node-size" min="1" max="20" step="1" value="${nodeSize}">
        `);

    // Event listeners for sliders
    d3.select("#center-force").on("input", function() {
        const value = +this.value;
        d3.select("#center-force-value").text(value);
        simulation.force("center").strength(value);
        simulation.alpha(1).restart();
    });

    d3.select("#repel-force").on("input", function() {
        const value = +this.value;
        d3.select("#repel-force-value").text(value);
        simulation.force("charge").strength(value);
        simulation.alpha(1).restart();
    });

    d3.select("#link-force").on("input", function() {
        const value = +this.value;
        d3.select("#link-force-value").text(value);
        simulation.force("link").strength(value);
        simulation.alpha(1).restart();
    });

    d3.select("#link-distance").on("input", function() {
        const value = +this.value;
        d3.select("#link-distance-value").text(value);
        simulation.force("link").distance(value);
        simulation.alpha(1).restart();
    });

    d3.select("#link-opacity").on("input", function() {
        const value = +this.value;
        d3.select("#link-opacity-value").text(value);
        link.attr("stroke-opacity", value);
    });

    d3.select("#link-width").on("input", function() {
        const value = +this.value;
        d3.select("#link-width-value").text(value);
        link.attr("stroke-width", value);
    });

    d3.select("#node-size").on("input", function() {
        const value = +this.value;
        d3.select("#node-size-value").text(value);
        node.selectAll("circle").attr("r", value);
        node.selectAll("text")
            .attr('x', value + 3)
            .style("font-size", `${value * 3.2}px`); // Doubled again from 1.6 to 3.2
        simulation.force("collision").radius(value);
        simulation.alpha(1).restart();
    });

    // Add this function to update colors when dark mode changes
    function updateColors(isDarkMode) {
        svg.style("background-color", "var(--bg-color)");
        link.attr("stroke", "var(--link-color)");
        node.selectAll("circle")
            .attr("fill", d => d.type === 'folder' ? "var(--folder-color)" : "var(--node-color)");
        node.selectAll("text")
            .style("fill", "var(--text-color)");
        d3.select("#graph-controls")
            .style("background-color", "var(--control-bg-color)")
            .style("color", "var(--text-color)");
    }

    // Add event listener for dark mode toggle
    document.addEventListener('darkModeChanged', function(e) {
        updateColors(e.detail.isDarkMode);
    });

    // Initial color update
    updateColors(document.body.classList.contains('dark-mode'));

    // Add double-click event listener to nodes
    node.on('dblclick', async function(event, d) {
        console.log('Node double-clicked:', d);

        // Fetch file content and open in editor
        try {
            const filePath = d.id; // Assuming d.id contains the file path
            const fileName = d.label || d.id.split('/').pop();

            // Use the fetchObsidianFileContent function
            const content = await window.fetchObsidianFileContent(filePath);

            // Use the editor's openFileInEditor function
            if (window.editorModule && typeof window.editorModule.openFileInEditor === 'function') {
                window.editorModule.openFileInEditor(filePath, fileName, content, 'text/markdown');

                // Switch to the Editor tab
                const editorTab = document.querySelector('.tab-button[data-tab="editor"]');
                if (editorTab) {
                    editorTab.click();
                }
            } else {
                console.error('Editor module or openFileInEditor function not found');
            }
        } catch (error) {
            console.error('Error opening file from graphview:', error);
            alert(`Failed to open the file "${d.label}".\nError: ${error.message}`);
        }
    });

    console.log("Graph initialization complete");
    console.log("Nodes rendered:", graphData.nodes.length);
    console.log("Links rendered:", graphData.links.length);
}

async function fetchMentusGraphData(apiKey, endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                gremlin: `g.V().project('id', 'label', 'type').by(id).by(label).by('type').fold().as('nodes').
                           select('nodes').unfold().as('node').
                           outE().project('source', 'target').by(__.select('node').select('id')).by(inV().id()).fold().as('edges').
                           select('nodes', 'edges')`
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            nodes: data.result.data[0].nodes,
            edges: data.result.data[0].edges
        };
    } catch (error) {
        console.error('Error fetching Mentus graph data:', error);
        return null;
    }
}

function mergeMentusData(obsidianData, mentusData) {
    if (!mentusData) return obsidianData;

    const mergedNodes = new Map([...obsidianData.nodes.map(n => [n.id, n])]);
    const mergedLinks = [...obsidianData.links];

    mentusData.nodes.forEach(node => {
        if (!mergedNodes.has(node.id)) {
            mergedNodes.set(node.id, {
                id: node.id,
                label: node.label,
                type: node.type
            });
        }
    });

    mentusData.edges.forEach(edge => {
        if (!mergedLinks.some(link => link.source === edge.source && link.target === edge.target)) {
            mergedLinks.push({
                source: edge.source,
                target: edge.target
            });
        }
    });

    return {
        nodes: Array.from(mergedNodes.values()),
        links: mergedLinks
    };
}

async function writeToMentusGraph(data, apiKey, endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                gremlin: `g.addV('${data.type}').property('id', '${data.id}').property('label', '${data.label}')`
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Data written to Mentus graph:', result);
        return result;
    } catch (error) {
        console.error('Error writing to Mentus graph:', error);
        return null;
    }
}

function fitGraphToContainer(g, zoom) {
    const svg = d3.select("#graph-container svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const bounds = g.node().getBBox();
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;
    const midX = bounds.x + fullWidth / 2;
    const midY = bounds.y + fullHeight / 2;

    if (fullWidth === 0 || fullHeight === 0) return;

    const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
    const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

function updateLoadingMessage(message = '') {
    const graphContainer = document.getElementById('graph-container');
    if (graphContainer) {
        if (isFetching) {
            graphContainer.innerHTML = '<div class="loading-message">Loading graph data... Please wait.</div>';
        } else if (!isDataFetched) {
            graphContainer.innerHTML = '<div class="loading-message">Graph data not loaded. Click to load.</div>';
        } else if (message) {
            graphContainer.innerHTML = `<div class="loading-message">${message}</div>`;
        }
    }
}

function clearLinkCache() {
    fileLinkCache.clear();
    lastCacheUpdate = null;
    console.log('Link cache cleared');
}

function showLoadingMessage() {
    const graphContainer = document.getElementById('graph-container');
    if (graphContainer) {
        graphContainer.innerHTML = '<div class="loading-message">Loading graph view... Please wait.</div>';
    }
}

// Update the checkGraphStatus function
window.checkGraphStatus = function() {
    const currentTime = Date.now();
    showLoadingMessage(); // Always show loading message when checking status
    if (isDataFetched && lastCacheUpdate && (currentTime - lastCacheUpdate < CACHE_EXPIRY_TIME)) {
        initializeGraph();
    } else if (!isFetching) {
        clearLinkCache(); // Clear cache before rebuilding
        buildGraphData();
    } else {
        updateLoadingMessage();
    }
};

// Update the buildGraphData function to show loading message
async function buildGraphData() {
    showLoadingMessage();
    await populateGraphData();
}

window.loadGraphView = buildGraphData;