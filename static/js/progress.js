/**
 * Fahamu - Progress Tracking Module
 * Handles user checkpoint visualization and anxiety assessment charts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Progress chart for anxiety assessments
    createAnxietyChart();
    
    // Update checkpoint functionality
    setupCheckpointUpdater();
    
    // Progress slider functionality
    setupProgressSliders();
});

/**
 * Create and display anxiety assessment chart
 */
function createAnxietyChart() {
    const assessmentData = document.querySelectorAll('table tbody tr');
    if (assessmentData.length === 0 || !document.getElementById('anxietyChart')) {
        return; // No data or no chart element
    }
    
    // Extract data from assessment history table
    const dates = [];
    const scores = [];
    
    assessmentData.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            dates.push(cells[0].textContent);
            // Extract the score value from "X/21" format
            const scoreText = cells[1].textContent;
            const score = parseInt(scoreText.split('/')[0], 10);
            scores.push(score);
        }
    });
    
    // Reverse arrays to show oldest to newest
    dates.reverse();
    scores.reverse();
    
    // Create chart
    const ctx = document.getElementById('anxietyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Anxiety Score (GAD-7)',
                data: scores,
                backgroundColor: 'rgba(91, 135, 165, 0.2)',
                borderColor: 'rgba(91, 135, 165, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
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
                    max: 21,
                    ticks: {
                        stepSize: 3
                    },
                    title: {
                        display: true,
                        text: 'Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Assessment Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const score = context.raw;
                            let severity = '';
                            
                            if (score <= 4) {
                                severity = 'Minimal Anxiety';
                            } else if (score <= 9) {
                                severity = 'Mild Anxiety';
                            } else if (score <= 14) {
                                severity = 'Moderate Anxiety';
                            } else {
                                severity = 'Severe Anxiety';
                            }
                            
                            return 'Severity: ' + severity;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 5,
                            yMax: 5,
                            borderColor: 'rgba(130, 184, 138, 0.5)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                content: 'Mild',
                                position: 'start'
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 10,
                            yMax: 10,
                            borderColor: 'rgba(245, 203, 156, 0.5)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                content: 'Moderate',
                                position: 'start'
                            }
                        },
                        line3: {
                            type: 'line',
                            yMin: 15,
                            yMax: 15,
                            borderColor: 'rgba(221, 115, 115, 0.5)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                content: 'Severe',
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Setup update checkpoint functionality
 */
function setupCheckpointUpdater() {
    // Buttons to open update modal
    const updateButtons = document.querySelectorAll('[data-bs-target="#updateCheckpointModal"]');
    
    updateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const checkpointId = this.getAttribute('data-id');
            const checkpointCard = this.closest('.progress-card');
            
            // Get checkpoint data
            const title = checkpointCard.querySelector('.progress-title').textContent;
            const progress = parseInt(checkpointCard.querySelector('.progress-bar').style.width, 10);
            const description = checkpointCard.querySelector('.progress-description')?.textContent.trim() || '';
            
            // Set values in form
            document.getElementById('update-checkpoint-id').value = checkpointId;
            document.getElementById('update-title').value = title;
            document.getElementById('update-description').value = description;
            document.getElementById('update-progress').value = progress;
            document.getElementById('update-progress-value').textContent = progress + '%';
        });
    });
    
    // Progress slider for update modal
    const updateProgressSlider = document.getElementById('update-progress');
    if (updateProgressSlider) {
        updateProgressSlider.addEventListener('input', function() {
            document.getElementById('update-progress-value').textContent = this.value + '%';
        });
    }
}

/**
 * Setup progress sliders for visual feedback
 */
function setupProgressSliders() {
    // Progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar');
    
    // Animate progress bars on page load
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        // Trigger reflow
        void bar.offsetWidth;
        
        // Animate to actual value
        bar.style.width = width;
    });
    
    // Progress slider for add checkpoint modal
    const addProgressSlider = document.querySelector('#checkpoint_form-progress');
    if (addProgressSlider) {
        const displayEl = document.createElement('div');
        displayEl.className = 'd-flex justify-content-between';
        displayEl.innerHTML = '<span>0%</span><span id="add-progress-value">10%</span><span>100%</span>';
        
        // Insert after the slider
        addProgressSlider.parentNode.insertBefore(displayEl, addProgressSlider.nextSibling);
        
        // Update the display value when slider changes
        addProgressSlider.addEventListener('input', function() {
            document.getElementById('add-progress-value').textContent = this.value + '%';
        });
        
        // Set initial value
        document.getElementById('add-progress-value').textContent = addProgressSlider.value + '%';
    }
}
