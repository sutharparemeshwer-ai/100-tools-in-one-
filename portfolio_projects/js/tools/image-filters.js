// js/tools/image-filters.js

// --- DOM Elements ---
let imageInput, editorArea, presetButtons, sliderControls, imagePreview, downloadBtn;

// --- State ---
let originalImage = null;
let currentFilter = 'none';
let filterValues = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0
};

const SLIDER_FILTERS = ['brightness', 'contrast', 'saturate', 'blur'];

// --- Core Logic ---

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        editorArea.classList.add('d-none');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        if (!originalImage) {
            originalImage = new Image();
        }
        originalImage.onload = () => {
            imagePreview.src = e.target.result;
            editorArea.classList.remove('d-none');
            resetFilters();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function buildFilterString() {
    let filterString = '';
    SLIDER_FILTERS.forEach(filter => {
        const value = filterValues[filter];
        const unit = filter === 'blur' ? 'px' : '%';
        if ((filter === 'blur' && value > 0) || (filter !== 'blur' && value !== 100)) {
            filterString += `${filter}(${value}${unit}) `;
        }
    });
    // Add non-slider filters
    if (filterValues.grayscale > 0) filterString += `grayscale(${filterValues.grayscale}%) `;
    if (filterValues.sepia > 0) filterString += `sepia(${filterValues.sepia}%) `;
    if (filterValues.invert > 0) filterString += `invert(${filterValues.invert}%) `;

    return filterString.trim() || 'none';
}

function applyFilters() {
    currentFilter = buildFilterString();
    imagePreview.style.filter = currentFilter;
}

function resetFilters() {
    filterValues = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, invert: 0 };
    
    // Reset slider UI
    document.querySelectorAll('.filter-slider').forEach(slider => {
        slider.value = filterValues[slider.dataset.filter];
        document.getElementById(`${slider.dataset.filter}-value`).textContent = slider.value;
    });

    // Update active preset button
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.replace('btn-primary', 'btn-outline-secondary');
        if (btn.dataset.filter === 'none') {
            btn.classList.replace('btn-outline-secondary', 'btn-primary');
        }
    });

    applyFilters();
}

function handleFilterClick(event) {
    const target = event.target.closest('.preset-btn');
    if (!target) return;

    resetFilters(); // Start from a clean slate
    const filterString = target.dataset.filter;

    if (filterString.includes('grayscale')) filterValues.grayscale = 100;
    if (filterString.includes('sepia')) filterValues.sepia = 100;
    if (filterString.includes('invert')) filterValues.invert = 100;

    applyFilters();

    // Update active button style
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.replace('btn-primary', 'btn-outline-secondary'));
    target.classList.replace('btn-outline-secondary', 'btn-primary');
}

function handleDownload() {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the image
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;

    // Apply the filter to the canvas context
    ctx.filter = buildFilterString();

    // Draw the image onto the canvas
    ctx.drawImage(originalImage, 0, 0);

    // Create a download link
    const dataUrl = canvas.toDataURL('image/png');
    downloadBtn.href = dataUrl;

    // The 'download' attribute is already in the HTML, so the browser will
    // trigger a download when this link is programmatically clicked or manually clicked.
    // We don't need to click it here, just update the href.
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    imageInput = document.getElementById('filter-image-input');
    editorArea = document.getElementById('filter-editor-area');
    presetButtons = document.getElementById('preset-buttons');
    sliderControls = document.getElementById('slider-controls');
    imagePreview = document.getElementById('image-preview');
    downloadBtn = document.getElementById('download-filtered-btn');

    // Attach event listeners
    imageInput.addEventListener('change', handleImageUpload);
    presetButtons.addEventListener('click', handleFilterClick);
    downloadBtn.addEventListener('click', handleDownload);

    sliderControls.addEventListener('input', (event) => {
        const slider = event.target;
        if (!slider.classList.contains('filter-slider')) return;

        const filterName = slider.dataset.filter;
        const value = slider.value;

        // Update state and UI
        filterValues[filterName] = value;
        document.getElementById(`${filterName}-value`).textContent = value;
        
        // De-select any active preset button except 'Original'
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.replace('btn-primary', 'btn-outline-secondary'));

        applyFilters();
    });
}

export function cleanup() {
    // Reset state when leaving the tool
    originalImage = null;
    resetFilters();
    if (imagePreview) imagePreview.src = '#';
    if (editorArea) editorArea.classList.add('d-none');
}