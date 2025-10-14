// js/router.js
const COMPONENTS_PATH = 'components';
const TOOLS_HTML_PATH = 'tools';
const TOOLS_MODULE_PATH = './tools';
const TOOLS_JSON = 'js/tools.json';

let currentToolModule = null;
let toolsList = [];

/* load static component (header/footer) */
async function loadComponent(targetId, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    document.getElementById(targetId).innerHTML = html;
  } catch (err) {
    console.error(err);
    document.getElementById(targetId).innerHTML = '';
  }
}

/* fetch JSON of tools */
async function loadToolsList() {
  try {
    const res = await fetch(TOOLS_JSON);
    if (!res.ok) throw new Error('tools.json not found');
    toolsList = await res.json();
  } catch (err) {
    console.error('Could not load tools list', err);
    toolsList = [];
  }
}

/* build nav and home/sidebar */
function buildCategorizedView(toolList, parentId) {
    const parentEl = document.getElementById(parentId);
    if (!parentEl) return;

    // Group tools by category
    const groupedTools = toolList.reduce((acc, tool) => {
        const category = tool.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(groupedTools).sort();

    // Generate HTML based on the view type (sidebar or home)
    if (parentId.includes('sidebar')) { // Sidebar Accordion View
        parentEl.innerHTML = sortedCategories.map((category, index) => {
            const categoryId = `category-${parentId}-${index}`;
            const linksHtml = groupedTools[category].map(t => `<a class="list-group-item list-group-item-action" href="#${t.id}">${t.name}</a>`).join('');
            return `
                <div class="accordion-item mytool">
                    <h2 class="accordion-header" id="heading-${categoryId}">
                        <button class="accordion-button collapsed mytool" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${categoryId}" aria-expanded="false" aria-controls="collapse-${categoryId}">
                            ${category}
                        </button>
                    </h2>
                    <div id="collapse-${categoryId}" class="accordion-collapse collapse" aria-labelledby="heading-${categoryId}" data-bs-parent="#${parentId}">
                        <div class="list-group list-group-flush">${linksHtml}</div>
                    </div>
                </div>`;
        }).join('');
    } else { // Home Page Card View
        parentEl.innerHTML = sortedCategories.map(category => {
            const cardsHtml = groupedTools[category].map(t => `
                <div class="col-md-3 mb-3">
                    <div class="card h-100">
                        <div class="card-body mytool">
                            <h5 class="card-title">${t.name}</h5>
                            <p class="card-text small">${t.description || ''}</p>
                            <a class="stretched-link" href="#${t.id}"></a>
                        </div>
                    </div>
                </div>`).join('');
            return `<div class="row mb-4"><div class="col-12"><h4>${category}</h4><hr></div>${cardsHtml}</div>`;
        }).join('');
    }
}

/* build nav and home/sidebar */
function buildNavAndHome() {
    buildCategorizedView(toolsList, 'tools-sidebar-list');
    buildCategorizedView(toolsList, 'tools-desktop-sidebar');
    buildCategorizedView(toolsList, 'home-list');
}

/* load tool html + optional module */
async function loadTool(name) {
  const app = document.getElementById('app');
  if (!app) return;

  // cleanup previous module
  if (currentToolModule && currentToolModule.cleanup) {
    try { await currentToolModule.cleanup(); } catch (e) { console.warn(e); }
    currentToolModule = null;
  }

  // if no name -> show home (optional)
  if (!name) {
    app.innerHTML = `
      <div class="mb-3 text-center mt-5 mb-5">
        <h3>Welcome — pick a tool</h3>
        <p>Use the sidebar or search to open a tool.</p>
      </div>
      <div id="home-list" class="row"></div>
    `;
    buildNavAndHome();
    return;
  }

  // fetch HTML fragment for tool
  try {
    const res = await fetch(`${TOOLS_HTML_PATH}/${name}.html`);
    if (!res.ok) throw new Error('Tool HTML not found');
    const html = await res.text();
    app.innerHTML = html;
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="alert alert-danger">Tool "${name}" not found.</div>`;
    return;
  }

  // try dynamic import for tool logic module (js/tools/{name}.js)
  try {
    const module = await import(`${TOOLS_MODULE_PATH}/${name}.js`);
    currentToolModule = module;
    if (module.init) await module.init();
  } catch (err) {
    console.info('No JS module for tool or import failed:', err.message);
  }
}

/* search helper: simple text match on name + description + tags */
function setupSearch() {
  const input = document.getElementById('tool-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    
    // Filter the tools list
    const filtered = toolsList.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.join(' ').toLowerCase().includes(q))
    );
    
    // Re-build the categorized views with the filtered list
    buildCategorizedView(filtered, 'tools-sidebar-list');
    buildCategorizedView(filtered, 'tools-desktop-sidebar');
    buildCategorizedView(filtered, 'home-list');
  });
}

/* start the app */
window.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('header', `${COMPONENTS_PATH}/header.html`);
  await loadComponent('footer', `${COMPONENTS_PATH}/footer.html`);
  await loadToolsList();
  buildNavAndHome();
  setupSearch();

  // Setup mobile sidebar collapse listener
  const sidebarList = document.getElementById('tools-sidebar-list');
  if (sidebarList) {
    sidebarList.addEventListener('click', (e) => {
      // Check if the clicked element is a link
      if (e.target.tagName === 'A') {
        const offcanvasEl = document.getElementById('toolsOffcanvas');
        // Use Bootstrap's native JS to hide the Offcanvas
        if (offcanvasEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
            bsOffcanvas.hide();
        }
      }
    });
  }

  // route on hashchange
  window.addEventListener('hashchange', () => loadTool(location.hash.slice(1)));
  // initial route
  loadTool(location.hash.slice(1));
});

// Hide splash screen after a delay
window.addEventListener('load', () => {
  setTimeout(() => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.style.opacity = '0';
    }
  }, 1000); // 1000ms = 1 second
});