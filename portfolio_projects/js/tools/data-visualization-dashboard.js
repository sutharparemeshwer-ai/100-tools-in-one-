// js/tools/data-visualization-dashboard.js

let chartInstance = null;
let chartControls = null;

const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';

// Sample data for the charts
const sampleData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
        label: 'Monthly Sales (in thousands)',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(99, 255, 132, 0.5)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(99, 255, 132, 1)'
        ],
        borderWidth: 1,
        fill: true,
    }]
};

/**
 * Dynamically loads a script from a CDN.
 * @param {string} url - The URL of the script to load.
 * @returns {Promise<void>}
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

function createChart(type = 'bar') {
    const ctx = document.getElementById('data-vis-chart')?.getContext('2d');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: type,
        data: sampleData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container height
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white' // Set legend text color to white
                    }
                },
                title: {
                    display: true,
                    text: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart Example`,
                    color: 'white' // Set title color to white
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white' // X-axis labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines for dark background
                    }
                },
                y: {
                    ticks: {
                        color: 'white' // Y-axis labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines for dark background
                    }
                }
            }
        }
    });
}

function handleControlClick(event) {
    const button = event.target.closest('button');
    if (!button || !button.dataset.chartType) return;

    // Update button styles
    chartControls.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');

    createChart(button.dataset.chartType);
}

export async function init() {
    await loadScript(CHART_JS_CDN);
    chartControls = document.getElementById('chart-controls');
    chartControls?.addEventListener('click', handleControlClick);
    createChart('bar'); // Create the default bar chart
}

export function cleanup() {
    chartControls?.removeEventListener('click', handleControlClick);
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}