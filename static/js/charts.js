/**
 * Fahamu - Charts Visualization Module
 * Creates and manages charts for analytics views
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for admin charts
    initializeAdminCharts();
    
    // Check for time range selector
    setupTimeRangeSelector();
});

/**
 * Initialize admin dashboard charts
 */
function initializeAdminCharts() {
    // Get analytics data
    const dataElement = document.getElementById('analyticsData');
    
    if (dataElement) {
        try {
            // Parse JSON data from data attributes
            const severityLabels = JSON.parse(dataElement.getAttribute('data-severity-labels'));
            const severityData = JSON.parse(dataElement.getAttribute('data-severity-data'));
            const months = JSON.parse(dataElement.getAttribute('data-months'));
            const userCounts = JSON.parse(dataElement.getAttribute('data-user-counts'));
            
            // Create charts
            createAnxietyLevelsChart(severityLabels, severityData);
            createUserGrowthChart(months, userCounts);
            createChatActivityChart();
            createUserProgressChart();
            createAnxietyTriggersChart();
        } catch (error) {
            console.error('Error parsing analytics data:', error);
        }
    }
    
    // Create anxiety level chart (dashboard)
    const anxietyLevelChart = document.getElementById('anxietyLevelChart');
    if (anxietyLevelChart) {
        createDashboardAnxietyChart(anxietyLevelChart);
    }
}

/**
 * Create anxiety levels distribution chart
 */
function createAnxietyLevelsChart(labels, data) {
    const anxietyLevelsChart = document.getElementById('anxietyLevelsChart');
    if (!anxietyLevelsChart) return;
    
    // Use provided data or fallback to demo data
    const chartLabels = labels && labels.length ? labels : ['Minimal', 'Mild', 'Moderate', 'Severe'];
    const chartData = data && data.length ? data : [15, 32, 27, 8];
    
    new Chart(anxietyLevelsChart, {
        type: 'pie',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: [
                    'rgba(130, 184, 138, 0.8)',  // Success/Green for Minimal
                    'rgba(91, 135, 165, 0.8)',   // Primary/Blue for Mild
                    'rgba(245, 203, 156, 0.8)',  // Warning/Orange for Moderate
                    'rgba(221, 115, 115, 0.8)'   // Danger/Red for Severe
                ],
                borderColor: [
                    'rgba(130, 184, 138, 1)',
                    'rgba(91, 135, 165, 1)',
                    'rgba(245, 203, 156, 1)',
                    'rgba(221, 115, 115, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create user growth chart
 */
function createUserGrowthChart(months, userCounts) {
    const userGrowthChart = document.getElementById('userGrowthChart');
    if (!userGrowthChart) return;
    
    // Use provided data or fallback to demo data
    const chartLabels = months && months.length ? months : 
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = userCounts && userCounts.length ? userCounts : 
        [12, 19, 25, 32, 45, 56, 72, 85, 102, 120, 135, 150];
    
    new Chart(userGrowthChart, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'User Registrations',
                data: chartData,
                fill: true,
                backgroundColor: 'rgba(91, 135, 165, 0.2)',
                borderColor: 'rgba(91, 135, 165, 1)',
                tension: 0.4,
                pointBackgroundColor: 'rgba(91, 135, 165, 1)',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Users'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

/**
 * Create chat activity chart
 */
function createChatActivityChart() {
    const chatActivityChart = document.getElementById('chatActivityChart');
    if (!chatActivityChart) return;
    
    // Demo data for chat activity
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const registeredUserChats = [45, 52, 49, 60, 55, 65, 42];
    const guestChats = [30, 25, 22, 28, 35, 40, 32];
    
    new Chart(chatActivityChart, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Registered Users',
                    data: registeredUserChats,
                    backgroundColor: 'rgba(91, 135, 165, 0.8)'
                },
                {
                    label: 'Guest Users',
                    data: guestChats,
                    backgroundColor: 'rgba(130, 184, 138, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Chats'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of Week'
                    }
                }
            }
        }
    });
}

/**
 * Create user progress chart
 */
function createUserProgressChart() {
    const userProgressChart = document.getElementById('userProgressChart');
    if (!userProgressChart) return;
    
    // Demo data for user progress
    const progressRanges = ['0-25%', '26-50%', '51-75%', '76-100%'];
    const userCounts = [25, 42, 38, 15];
    
    new Chart(userProgressChart, {
        type: 'bar',
        data: {
            labels: progressRanges,
            datasets: [{
                label: 'Users',
                data: userCounts,
                backgroundColor: [
                    'rgba(221, 115, 115, 0.8)',  // Low progress
                    'rgba(245, 203, 156, 0.8)',  // Medium-low progress
                    'rgba(91, 135, 165, 0.8)',   // Medium-high progress
                    'rgba(130, 184, 138, 0.8)'   // High progress
                ],
                borderColor: [
                    'rgba(221, 115, 115, 1)',
                    'rgba(245, 203, 156, 1)',
                    'rgba(91, 135, 165, 1)',
                    'rgba(130, 184, 138, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Users'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Progress Range'
                    }
                }
            }
        }
    });
}

/**
 * Create anxiety triggers chart
 */
function createAnxietyTriggersChart() {
    const anxietyTriggersChart = document.getElementById('anxietyTriggersChart');
    const anxietyTriggersTable = document.getElementById('anxietyTriggersTable');
    
    if (!anxietyTriggersChart) return;
    
    // Demo data for anxiety triggers
    const triggers = [
        'Work/School Stress', 
        'Social Situations', 
        'Health Concerns', 
        'Financial Worries',
        'Family Issues', 
        'Uncertainty', 
        'Past Trauma'
    ];
    
    const occurrences = [35, 28, 22, 18, 15, 12, 10];
    
    // Create chart
    new Chart(anxietyTriggersChart, {
        type: 'horizontalBar',
        data: {
            labels: triggers,
            datasets: [{
                label: 'Frequency',
                data: occurrences,
                backgroundColor: 'rgba(91, 135, 165, 0.8)',
                borderColor: 'rgba(91, 135, 165, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Occurrence Count'
                    }
                }
            }
        }
    });
    
    // Populate table
    if (anxietyTriggersTable) {
        const tbody = anxietyTriggersTable.querySelector('tbody');
        const total = occurrences.reduce((sum, value) => sum + value, 0);
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Add rows
        triggers.forEach((trigger, index) => {
            const percentage = ((occurrences[index] / total) * 100).toFixed(1);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trigger}</td>
                <td>${occurrences[index]}</td>
                <td>${percentage}%</td>
            `;
            
            tbody.appendChild(row);
        });
    }
}

/**
 * Create dashboard anxiety chart
 */
function createDashboardAnxietyChart(element) {
    // Demo data for dashboard anxiety levels
    const labels = ['Minimal', 'Mild', 'Moderate', 'Severe'];
    const data = [15, 32, 27, 8];
    
    new Chart(element, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(130, 184, 138, 0.8)',  // Success/Green for Minimal
                    'rgba(91, 135, 165, 0.8)',   // Primary/Blue for Mild
                    'rgba(245, 203, 156, 0.8)',  // Warning/Orange for Moderate
                    'rgba(221, 115, 115, 0.8)'   // Danger/Red for Severe
                ],
                borderColor: [
                    'rgba(130, 184, 138, 1)',
                    'rgba(91, 135, 165, 1)',
                    'rgba(245, 203, 156, 1)',
                    'rgba(221, 115, 115, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Setup time range selector for analytics
 */
function setupTimeRangeSelector() {
    const timeRangeSelector = document.getElementById('timeRangeSelector');
    
    if (timeRangeSelector) {
        timeRangeSelector.addEventListener('change', function() {
            // This would normally trigger a fetch to get data for the selected time range
            // For this demo, we'll just show an alert
            alert(`Data would be filtered for time range: ${this.options[this.selectedIndex].text}`);
        });
    }
}
