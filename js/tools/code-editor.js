// js/tools/code-editor.js

let editor;

const CDN_URLS = {
    css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css',
    theme: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css',
    js: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js',
    modes: {
        xml: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.min.js',
        javascript: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js',
        css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.min.js',
        htmlmixed: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/htmlmixed/htmlmixed.min.js',
    }
};

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadCSS(url) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

async function initializeEditor() {
    loadCSS(CDN_URLS.css);
    loadCSS(CDN_URLS.theme);
    await loadScript(CDN_URLS.js);
    await Promise.all([
        loadScript(CDN_URLS.modes.xml),
        loadScript(CDN_URLS.modes.javascript),
        loadScript(CDN_URLS.modes.css),
        loadScript(CDN_URLS.modes.htmlmixed),
    ]);

    const textarea = document.getElementById('code-editor-textarea');
    editor = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: 'material-darker',
        mode: 'htmlmixed',
        tabSize: 2,
    });

    document.getElementById('language-select').addEventListener('change', (e) => {
        editor.setOption('mode', e.target.value);
    });
}

export async function init() {
    try {
        await initializeEditor();
    } catch (error) {
        console.error("Failed to load CodeMirror editor:", error);
        const editorArea = document.getElementById('code-editor-textarea');
        if (editorArea) {
            editorArea.value = "Error: Could not load the code editor. Please check your internet connection.";
        }
    }
}

export function cleanup() {
    if (editor) {
        editor.toTextArea();
        editor = null;
    }
}