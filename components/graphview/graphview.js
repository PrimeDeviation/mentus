document.addEventListener("DOMContentLoaded", function() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let data = {
        nodes: [],
        links: []
    };

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line");

    let node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g");

    function updateGraph() {
        // Remove existing nodes and links
        node.remove();
        link.remove();

        // Update the links
        link = svg.select(".links")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", 2)
            .attr("stroke", "#999");

        // Update the nodes
        node = svg.select(".nodes")
            .selectAll("g")
            .data(data.nodes)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", 10)
            .attr("fill", d => d.color || "#69b3a2");

        node.append("text")
            .attr("dy", -15)
            .attr("text-anchor", "middle")
            .text(d => d.id)
            .attr("fill", "#fff");

        node.append("title")
            .text(d => d.id);

        simulation.nodes(data.nodes);
        simulation.force("link").links(data.links);
        simulation.alpha(1).restart();
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

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Function to add a new node
    function addNode(id, color) {
        if (!data.nodes.some(n => n.id === id)) {
            data.nodes.push({ id, color });
            updateGraph();
        }
    }

    // Function to add a new link
    function addLink(source, target) {
        if (!data.links.some(l => l.source.id === source && l.target.id === target)) {
            data.links.push({ source, target });
            updateGraph();
        }
    }

    // Load saved chat sessions and create nodes
    function loadChatSessions() {
        chrome.storage.local.get(['chatSessions'], function(result) {
            const chatSessions = result.chatSessions || [];
            chatSessions.forEach((session, index) => {
                const nodeId = `Chat ${index + 1}`;
                addNode(nodeId, "#4CAF50");
                if (index > 0) {
                    addLink(`Chat ${index}`, nodeId);
                }
            });
        });
    }

    // Load chat sessions when the graph is initialized
    loadChatSessions();

    // Expose these functions globally for testing
    window.addNode = addNode;
    window.addLink = addLink;
    window.loadChatSessions = loadChatSessions;
});
