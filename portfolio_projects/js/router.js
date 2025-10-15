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

const CATEGORY_ICONS = {
    "Games": "fa-solid fa-gamepad",
    "Calculators": "fa-solid fa-calculator",
    "Health & Fitness": "fa-solid fa-heart-pulse",
    "Forms & UI": "fa-solid fa-object-group",
    "Generators": "fa-solid fa-wand-magic-sparkles",
    "System & Hardware": "fa-solid fa-microchip",
    "Data & API": "fa-solid fa-database",
    "Productivity & Organization": "fa-solid fa-list-check",
    "Finance & Calculators": "fa-solid fa-sack-dollar",
    "Text & Content": "fa-solid fa-file-alt",
    "Fun & Creative": "fa-solid fa-lightbulb",
    "Developer Tools": "fa-solid fa-code",
    "Utilities": "fa-solid fa-screwdriver-wrench",
    "Uncategorized": "fa-solid fa-shapes"
};

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
            const iconClass = CATEGORY_ICONS[category] || 'fa-solid fa-star';
            const linksHtml = groupedTools[category].map(t => `
                <li class="nav-item">
                    <a href="#${t.id}" class="nav-link">
                        <span class="nav-icon"><i class="fa-solid fa-screwdriver-wrench"></i></span>
                        <span class="nav-text">${t.name}</span>
                    </a>
                </li>`).join('');
            return `
                <div class="sidebar-section">
                    <div class="sidebar-section-header" data-bs-toggle="collapse" data-bs-target="#sidebar-cat-${index}">
                        <h6 class="sidebar-section-title">${category}</h6>
                        <i class="fa-solid fa-chevron-down category-chevron"></i>
                    </div>
                    <ul class="nav-list collapse" id="sidebar-cat-${index}">${linksHtml}</ul>
                </div>`;
        }).join('');
    } else { // Home Page Card View
        parentEl.innerHTML = sortedCategories.map(category => {
            const iconClass = CATEGORY_ICONS[category] || 'fa-solid fa-star';
            const cardsHtml = groupedTools[category].map(t => `
                <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 home-tool-card">
                        <div class="card-body mytool d-flex flex-column">
                            <h5 class="card-title mb-2">${t.name}</h5>
                            <p class="card-text small flex-grow-1">${t.description || ''}</p>
                            <div class="card-icon-bottom"><i class="fa-solid fa-arrow-right"></i></div>
                            <a class="stretched-link" href="#${t.id}"></a>
                        </div>
                    </div>
                </div>`).join('');
            // Create a safe ID for the anchor link
            const categoryId = `category-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
            return `<div class="row mb-4" id="${categoryId}"><div class="col-12"><h4 class="category-header"><i class="${iconClass} me-2"></i>${category}</h4></div>${cardsHtml}</div>`;
        }).join('');
    }
}

/**
 * Builds the category grid for the homepage.
 */
function buildCategoryGrid() {
    const grid = document.getElementById('core-categories-grid');
    if (!grid) return;

    const categories = [...new Set(toolsList.map(t => t.category || 'Uncategorized'))].sort();
    
    const createCard = (category) => {
        const iconClass = CATEGORY_ICONS[category] || 'fa-solid fa-star';
        const categoryId = `category-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        return `
            <div class="col">
                <a href="#${categoryId}" class="core-tool-card h-100">${category}</a>
            </div>`;
    };

    grid.innerHTML = categories.map(createCard).join('');
}

/**
 * Adds smooth scrolling to the category slider links and prevents router interference.
 */
function setupCategorySliderLinks() {
    const grid = document.getElementById('core-categories-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
        const link = e.target.closest('a.core-tool-card');
        if (!link) return;

        e.preventDefault(); // Stop the browser from changing the hash immediately

        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Manually scroll to the element smoothly
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

/* build nav and home/sidebar */
function buildNavAndHome() {
    buildCategorizedView(toolsList, 'home-list'); // Only build the home page list
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
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">A Suite of Powerful Web Tools</h1>
          <p class="hero-subtitle">Discover ${toolsList.length} meticulously crafted utilities, games, and generators, all in one place.</p>
          <a href="#all-tools" class="btn hero-cta-btn">Explore Now</a>
        </div>
        <div class="hero-background-animation"></div>
      </div>

      <!-- "Our Core Tools" Section -->
      <div class="core-tools-container">
        <div class="container">
            <h1 class="text-center mb-5">Explore by Category</h1>
            <div id="core-categories-grid" class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3 justify-content-center"></div>
        </div>
      </div>

      <!-- "We deal with" Section -->
      <div class="tool-slider-container-fluid">
          <h1 class="text-center mb-5">We deal with</h1>
          <div class="scrolling-wrapper">
              <div class="scrolling-track">
                  <!-- Cards are duplicated for seamless looping -->
                  <a href="#" class="tool-card"><i class="fa-solid fa-brain"></i> AI Analytics</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cloud"></i> Cloud Storage</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-shield-halved"></i> Data Security</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-users"></i> CRM Integration</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-code-branch"></i> API Management</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-chart-line"></i> Business Intel</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cubes"></i> DevOps</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-mobile-screen-button"></i> Mobile Solutions</a>
                  <!-- Duplicate Set -->
                  <a href="#" class="tool-card"><i class="fa-solid fa-brain"></i> AI Analytics</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cloud"></i> Cloud Storage</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-shield-halved"></i> Data Security</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-users"></i> CRM Integration</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-code-branch"></i> API Management</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-chart-line"></i> Business Intel</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-cubes"></i> DevOps</a>
                  <a href="#" class="tool-card"><i class="fa-solid fa-mobile-screen-button"></i> Mobile Solutions</a>
              </div>
          </div>
      </div>
      
      <!-- End "We deal with" Section -->
      
      <div class="container mt-5">
        <div id="home-list" class="row">
        
        </div>
      </div>
      <br>
    `;
    buildNavAndHome();
    buildCategoryGrid();
    setupCategorySliderLinks();
    return;
  }

  // Handle the dedicated "All Tools" page
  if (name === 'all-tools') {
      try {
          const res = await fetch(`${TOOLS_HTML_PATH}/all-tools.html`);
          if (!res.ok) throw new Error('all-tools.html not found');
          app.innerHTML = await res.text();
          buildAllToolsGrid(toolsList); // Populate the grid
          setupAllToolsSearch(); // Activate the search bar
      } catch (err) {
          console.error('Error loading all-tools page:', err);
          app.innerHTML = `<div class="alert alert-danger">Could not load the tool suite page.</div>`;
      }
      return;
  }

  // fetch HTML fragment for tool
  try {
    const res = await fetch(`${TOOLS_HTML_PATH}/${name}.html`);
    if (!res.ok) throw new Error(`Tool HTML not found for "${name}"`);
    const html = await res.text();
    // Wrap tool content in a standard container for consistent layout
    app.innerHTML = `
      <div class="container">
        ${html}
      </div>
    `;
  } catch (err) {
    console.error(`Error loading tool ${name}:`, err);
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
    buildCategorizedView(filtered, 'home-list'); // Only need to update the home list now
  });
}

/* theme switcher logic */
function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.body.classList.remove('light-theme');
            toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    };

    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', () => {
        let newTheme = 'dark';
        if (!document.body.classList.contains('light-theme')) {
            newTheme = 'light';
        }
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Also add a button for the mobile search toggle area
    const mobileToggle = document.createElement('button');
    mobileToggle.id = 'theme-toggle-btn-mobile';
    mobileToggle.className = 'btn btn-outline-secondary ms-2 d-lg-none';
    mobileToggle.innerHTML = toggleBtn.innerHTML;
    mobileToggle.addEventListener('click', () => toggleBtn.click());
    document.querySelector('.navbar-toggler').insertAdjacentElement('beforebegin', mobileToggle);
}

/* "Back to Top" button logic */
function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;

    // Show or hide the button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    });
}

/* start the app */
window.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('header', `${COMPONENTS_PATH}/header.html`);
  await loadComponent('footer', `${COMPONENTS_PATH}/footer.html`);
  await loadToolsList();
  buildNavAndHome();
  setupSearch();
  setupThemeToggle();
  setupBackToTopButton();

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