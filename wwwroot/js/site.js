// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
const apiBaseUrl = 'https://localhost:7082/api/employees'; // Update with your API URL
let compensationChart, experienceChart;
let currentPage = 1;
const itemsPerPage = 10;
let allEmployees = [];

const loadingSpinner = document.getElementById('loadingSpinner');
const currentDateEl = document.getElementById('currentDate');
const roleFilter = document.getElementById('roleFilter');
const locationFilter = document.getElementById('locationFilter');
const globalIncrement = document.getElementById('globalIncrement');
const includeInactive = document.getElementById('includeInactive');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const exportDataBtn = document.getElementById('exportData');
const employeesTable = document.getElementById('employeesTable');
const pagination = document.getElementById('pagination');
const compensationStats = document.getElementById('compensationStats');
const groupBy = document.getElementById('groupBy');
const experienceChartType = document.getElementById('experienceChartType');
const updateExperienceBtn = document.getElementById('updateExperience');
const experienceTable = document.getElementById('experienceTable');
const groupByHeader = document.getElementById('groupByHeader');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
        
    await Promise.all([
        loadRoles(),
        loadLocations(),
        loadEmployees(),
        loadCompensationChart(),
        loadExperienceGroups()
    ]);

    // Set up event listeners
    applyFiltersBtn.addEventListener('click', async () => {
        await loadEmployees();
        await loadCompensationChart();
    });

    resetFiltersBtn.addEventListener('click', resetFilters);

    exportDataBtn.addEventListener('click', exportToCSV);

    updateExperienceBtn.addEventListener('click', async () => {
        await loadExperienceGroups();
    });

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Load roles dropdown
async function loadRoles() {
    try {
        showLoading();
        const response = await fetch(`${apiBaseUrl}/roles`);
        const roles = await response.json();

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading roles:', error);
        showError('Failed to load roles. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load locations dropdown
async function loadLocations() {
    try {
        showLoading();
        const response = await fetch(`${apiBaseUrl}/locations`);
        const locations = await response.json();

        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading locations:', error);
        showError('Failed to load locations. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load employees table with pagination
async function loadEmployees(page = 1) {
    try {
        showLoading();
        currentPage = page;

        const role = roleFilter.value;
        const location = locationFilter.value;
                const inactive = includeInactive.checked;

        let url = `${apiBaseUrl}?includeInactive=${inactive}`;
        if (role) url += `&role=${encodeURIComponent(role)}`;
        if (location) url += `&location=${encodeURIComponent(location)}`;
        
        const response = await fetch(url);
        allEmployees = await response.json();

        // Calculate pagination
        const totalPages = Math.ceil(allEmployees.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allEmployees.length);
        const paginatedEmployees = allEmployees.slice(startIndex, endIndex);

        // Clear existing table rows
        employeesTable.innerHTML = '';
        // Add new rows
        paginatedEmployees.forEach(employee => {
            const row = document.createElement('tr');
            row.className = 'fade-in';

            row.innerHTML = `
                            <td>${employee.name}</td>
                            <td>${employee.role}</td>
                            <td>${employee.location}</td>
                            <td>${employee.experienceRange || '-'}</td>
                            <td>₹${employee.currentCompensation?.toLocaleString('en-IN') || '0'}</td>
                            <td>₹${compensationMode === "global" ? (employee.currentCompensation * (100 + Number(globalIncrement.value)) / 100)?.toLocaleString('en-IN') : (employee.currentCompensation * (100 + (Number(locationIncrements[employee.location])||0)) / 100)?.toLocaleString('en-IN')}</td>
                            <td>
                                <span class="badge rounded-pill ${employee.isActive ? 'bg-success' : 'bg-danger'}">
                                    ${employee.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        `;

            employeesTable.appendChild(row);
        });

        // Update pagination
        updatePagination(totalPages, page);

        // Load compensation stats
        loadCompensationStats();
    } catch (error) {
        console.error('Error loading employees:', error);
        showError('Failed to load employee data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Update pagination controls
function updatePagination(totalPages, currentPage) {
    pagination.innerHTML = '';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
                    <a class="page-link" href="#" aria-label="Previous" ${currentPage === 1 ? 'tabindex="-1"' : ''}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                `;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) loadEmployees(currentPage - 1);
    });
    pagination.appendChild(prevLi);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            loadEmployees(i);
        });
        pagination.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
                    <a class="page-link" href="#" aria-label="Next" ${currentPage === totalPages ? 'tabindex="-1"' : ''}>
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                `;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) loadEmployees(currentPage + 1);
    });
    pagination.appendChild(nextLi);
}

// Load compensation chart
async function loadCompensationChart() {
    try {
        showLoading();
        const location = locationFilter.value;
        let url = `${apiBaseUrl}/average-compensation`;

        const response = await fetch(url);
        const stats = await response.json();

        // Prepare chart data
        const locations = stats.map(stat => stat.location);
        const averages = stats.map(stat => stat.averageCompensation);

        // Destroy previous chart if it exists
        if (compensationChart) {
            compensationChart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('compensationChart').getContext('2d');
        compensationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: locations,
                datasets: [{
                    label: 'Average Compensation (INR)',
                    data: averages,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return '₹' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Average Compensation by Location',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading compensation chart:', error);
        showError('Failed to load compensation data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load compensation statistics
function loadCompensationStats() {
    if (allEmployees.length === 0) {
        compensationStats.innerHTML = '<div class="col-12 text-center">No data available</div>';
        return;
    }

    // Calculate stats
    const activeEmployees = allEmployees.filter(e => e.isActive);
    const totalCompensation = activeEmployees.reduce((sum, emp) => sum + (emp.currentCompensation || 0), 0);
    const avgCompensation = totalCompensation / activeEmployees.length;
    const minCompensation = Math.min(...activeEmployees.map(e => e.currentCompensation || 0));
    const maxCompensation = Math.max(...activeEmployees.map(e => e.currentCompensation || 0));

    compensationStats.innerHTML = `
                    <div class="col-md-6 col-6 mb-3">
                        <div class="card stat-card h-100">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Total Employees</h6>
                                <h3 class="card-title">${allEmployees.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-6 mb-3">
                        <div class="card stat-card h-100">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Avg Compensation</h6>
                                <h3 class="card-title">₹${avgCompensation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-6 mb-3">
                        <div class="card stat-card h-100">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Min Compensation</h6>
                                <h3 class="card-title">₹${minCompensation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-6 mb-3">
                        <div class="card stat-card h-100">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Max Compensation</h6>
                                <h3 class="card-title">₹${maxCompensation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                            </div>
                        </div>
                    </div>
                `;
}

// Load experience groups
async function loadExperienceGroups() {
    try {
        showLoading();
        const groupByValue = groupBy.value;
        const chartType = experienceChartType.value;
        let url = `${apiBaseUrl}/experience-groups`;

        if (groupByValue) {
            url += `?groupBy=${encodeURIComponent(groupByValue)}`;
        }

        const response = await fetch(url);
        const groups = await response.json();

        
        groupByHeader.textContent = groupByValue || '-';

        experienceTable.innerHTML = '';

        groups.forEach(group => {
            const row = document.createElement('tr');
            row.className = 'fade-in';

            row.innerHTML = `
                            <td>${group.experienceRange}</td>
                            <td>${group.groupByValue || '-'}</td>
                            <td>${group.employeeCount}</td>
                        `;

            experienceTable.appendChild(row);
        });

        // Update chart
        updateExperienceChart(groups, groupByValue, chartType);
    } catch (error) {
        console.error('Error loading experience groups:', error);
        showError('Failed to load experience data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Update experience chart
function updateExperienceChart(groups, groupByValue, chartType) {
    if (experienceChart) {
        experienceChart.destroy();
    }

    const ctx = document.getElementById('experienceChart').getContext('2d');

    // Prepare data based on grouping
    let datasets = [];
    let labels = [];

    if (!groupByValue) {
        labels = groups.map(g => g.experienceRange);
        datasets = [{
            label: 'Employee Count',
            data: groups.map(g => g.employeeCount),
            backgroundColor: getChartColors(groups.length, 0.7),
            borderColor: getChartColors(groups.length, 1),
            borderWidth: 1
        }];
    } else {
        // Grouped chart by location/role
        const uniqueGroups = [...new Set(groups.map(g => g.groupByValue))];
        labels = [...new Set(groups.map(g => g.experienceRange))];

        datasets = uniqueGroups.map((groupValue, i) => {
            const groupData = groups.filter(g => g.groupByValue === groupValue);
            const counts = labels.map(label => {
                const match = groupData.find(g => g.experienceRange === label);
                return match ? match.employeeCount : 0;
            });

            return {
                label: groupValue,
                data: counts,
                backgroundColor: getChartColors(uniqueGroups.length, 0.7)[i],
                borderColor: getChartColors(uniqueGroups.length, 1)[i],
                borderWidth: 1
            };
        });
    }

    // Chart configuration
    const config = {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: groupByValue
                        ? `Experience Distribution by ${groupByValue}`
                        : 'Experience Distribution',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            if (groupByValue) {
                                return `${groupByValue}: ${context.dataset.label}`;
                            }
                            return '';
                        }
                    }
                },
                datalabels: {
                    display: chartType !== 'bar',
                    formatter: (value) => {
                        return value > 5 ? value : '';
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: chartType === 'bar' ? {
                x: {
                    stacked: !!groupByValue,
                    title: {
                        display: true,
                        text: 'Years of Experience'
                    }
                },
                y: {
                    stacked: !!groupByValue,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Employees'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            } : undefined
        }
    };

    experienceChart = new Chart(ctx, config);
}

function getChartColors(count, opacity = 1) {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
        const hue = (i * hueStep) % 360;
        colors.push(`hsla(${hue}, 70%, 50%, ${opacity})`);
    }

    return colors;
}

// Reset all filters
function resetFilters() {
    roleFilter.value = '';
    locationFilter.value = '';
    //experienceFilter.value = '';
    includeInactive.checked = false;
    loadEmployees();
    loadCompensationChart();
}

// Export data to CSV
function exportToCSV() {
    if (allEmployees.length === 0) {
        showError('No data to export');
        return;
    }

    // data for export
    const dataToExport = allEmployees.map(emp => ({
        Name: emp.name,
        Role: emp.role,
        Location: emp.location,
        Experience: emp.experienceRange || '',
        Compensation: emp.currentCompensation || 0,
        Status: emp.isActive ? 'Active' : 'Inactive'
    }));

    const csv = Papa.unparse(dataToExport);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show error message
function showError(message) {
    alert(message);
}

let compensationMode = 'global';
let locationIncrements = {};

document.getElementById('globalMode').addEventListener('change', updateCompensationModeUI);
document.getElementById('customMode').addEventListener('change', updateCompensationModeUI);

function updateCompensationModeUI() {
    compensationMode = document.getElementById('globalMode').checked ? 'global' : 'custom';

    // Show/hide appropriate controls
    document.getElementById('globalIncrementContainer').classList.toggle('d-none', compensationMode === 'custom');
    document.getElementById('customIncrementsPanel').classList.toggle('d-none', compensationMode === 'global');
}

function initializeLocationIncrementInputs() {
    const container = document.getElementById('locationIncrementsContainer');
    if (!container) return;

    // Get unique locations from current view
    const locations = [...new Set(allEmployees.map(e => e.location).filter(Boolean))];
    container.innerHTML = locations.map(location => `
        <div class="col-md-3 mb-3">
            <div class="increment-control">
                <label for="${location}">${location}</label>
                <div class="input-group">
                    <input type="number" class="form-control location-increment-input" 
                           id="${location}"
                           min="0" max="100" step="1"
                           value="${locationIncrements[location] || 0}">
                    <span class="input-group-text">%</span>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.location-increment-input').forEach(input => {
        input.addEventListener('change', function () {
            const location = this.id;
            const value = Number(this.value);
            locationIncrements[location] = value;
            
        });
    });
}
