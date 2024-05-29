const { parseMarkdownToGraph } = require('./src/translation_module');

const graphData = parseMarkdownToGraph('knowledge_ontology.md');
console.log(JSON.stringify(graphData, null, 2));
