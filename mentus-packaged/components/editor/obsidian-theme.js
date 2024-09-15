const obsidianTheme = CodeMirror.defineSimpleMode("obsidian", {
    // Token styles
    start: [
        {regex: /\*\*/, token: "strong"},
        {regex: /__/, token: "strong"},
        {regex: /\*(?![*])/, token: "em"},
        {regex: /_(?![_])/, token: "em"},
        {regex: /`/, token: "code"},
        {regex: /\[\[.*?\]\]/, token: "link"},
        {regex: /\[.*?\]\(.*?\)/, token: "link"},
        {regex: /^#+\s+.*$/, token: "header"},
        {regex: /^(-|\*|\+)\s+/, token: "list"},
        {regex: /^\d+\.\s+/, token: "list"},
        {regex: /^>.*$/, token: "quote"},
    ],

    // The multi-line comment state.
    comment: [
        {regex: /.*?\*\//, token: "comment", next: "start"},
        {regex: /.*/, token: "comment"}
    ],

    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    }
});

CodeMirror.defineOption("theme", "obsidian", function(cm) {
    cm.setOption("theme", "default");
    cm.setOption("mode", "obsidian");
});

// Export the theme
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { obsidianTheme };
} else if (typeof window !== 'undefined') {
    window.obsidianTheme = obsidianTheme;
}