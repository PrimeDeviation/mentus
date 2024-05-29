const fs = require('fs');
const cytoscape = require('cytoscape');

function parseMarkdownToGraph(mdFilePath) {
    const data = fs.readFileSync(mdFilePath, 'utf8');
    const lines = data.split('\\n');
    const nodes = [];
    const edges = [];

    lines.forEach((line, index) => {
        if (line.startsWith('- ')) {
            const domain = line.substring(2).trim();
            nodes.push({ data: { id: domain, label: domain } });
            if (index > 0) {
                edges.push({ data: { source: lines[index - 1].substring(2).trim(), target: domain } });
            }
        }
    });

    return { nodes, edges };
}

module.exports = { parseMarkdownToGraph };
