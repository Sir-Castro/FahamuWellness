/**
 * Fahamu - Admin Dashboard JavaScript
 * Handles admin interface functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize notification panel
    initNotificationPanel();
    
    // Setup user search functionality
    setupUserSearch();
    
    // Setup user view modal
    setupUserViewModal();
    
    // Setup user deletion
    setupUserDeletion();
    
    // Calculate and display statistics
    calculateStatistics();
});

/**
 * Initialize notification panel functionality
 */
function initNotificationPanel() {
    const notificationPanel = document.getElementById('notificationPanel');
    const showPanelBtn = document.getElementById('showNotificationPanel');
    const closePanelBtn = document.getElementById('closeNotificationPanel');
    const notificationForm = document.getElementById('sendNotificationForm');
    const sendNotificationBtns = document.querySelectorAll('.send-notification-btn');
    
    // Show notification panel when button is clicked
    if (showPanelBtn) {
        showPanelBtn.addEventListener('click', function() {
            notificationPanel.classList.add('active');
        });
    }
    
    // Close notification panel
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', function() {
            notificationPanel.classList.remove('active');
        });
    }
    
    // Set recipient when send notification button is clicked
    sendNotificationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const username = this.getAttribute('data-username');
            
            if (notificationPanel) {
                document.getElementById('recipient').value = username;
                document.getElementById('recipientId').value = userId;
                notificationPanel.classList.add('active');
                
                // Focus on subject field
                document.getElementById('subject').focus();
            }
        });
    });
    
    // Handle notification form submission
    if (notificationForm) {
        notificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('recipientId').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (!userId || !subject || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Send notification to server
            fetch('/admin/send_notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    subject: subject,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    alert('Notification sent successfully');
                    
                    // Reset form and close panel
                    notificationForm.reset();
                    notificationPanel.classList.remove('active');
                } else {
                    alert('Error sending notification: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while sending the notification');
            });
        });
    }
}

/**
 * Setup user search functionality
 */
function setupUserSearch() {
    const searchInput = document.getElementById('userSearchInput');
    const searchBtn = document.getElementById('userSearchBtn');
    const usersTable = document.getElementById('usersTable');
    
    if (searchInput && searchBtn && usersTable) {
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = usersTable.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const username = row.querySelector('.user-name').textContent.toLowerCase();
                const email = row.querySelector('.user-email').textContent.toLowerCase();
                
                if (username.includes(searchTerm) || email.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };
        
        // Search on button click
        searchBtn.addEventListener('click', performSearch);
        
        // Search on enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
                e.preventDefault();
            }
        });
    }
}

/**
 * Setup user view modal functionality
 */
function setupUserViewModal() {
    const viewButtons = document.querySelectorAll('.view-user-btn');
    const modalSendNotificationBtn = document.getElementById('modalSendNotification');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            
            // This would normally fetch user details from server
            // For demo purposes, we'll get data from the row
            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            
            if (row) {
                // Get user data from row
                const username = row.querySelector('.user-name').textContent;
                const email = row.querySelector('.user-email').textContent;
                const joined = row.querySelectorAll('td')[2].textContent;
                const chats = row.querySelectorAll('td')[3].textContent;
                const checkpoints = row.querySelectorAll('td')[4].textContent;
                
                // Set modal values
                document.getElementById('modalUsername').textContent = username;
                document.getElementById('modalEmail').textContent = email;
                document.getElementById('modalJoined').textContent = joined;
                document.getElementById('modalChats').textContent = chats;
                document.getElementById('modalCheckpoints').textContent = checkpoints;
                
                // Voice preference, messages, and assessments would normally be fetched from server
                document.getElementById('modalVoice').textContent = 'Unknown';
                document.getElementById('modalMessages').textContent = 'Unknown';
                document.getElementById('modalAssessments').textContent = 'Unknown';
                
                // Clear tables
                document.getElementById('checkpointsTable').querySelector('tbody').innerHTML = '';
                document.getElementById('assessmentsTable').querySelector('tbody').innerHTML = '';
                
                // Set user ID for send notification button
                if (modalSendNotificationBtn) {
                    modalSendNotificationBtn.setAttribute('data-user-id', userId);
                    modalSendNotificationBtn.setAttribute('data-username', username);
                }
            }
        });
    });
    
    // Send notification from modal
    if (modalSendNotificationBtn) {
        modalSendNotificationBtn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const username = this.getAttribute('data-username');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('viewUserModal'));
            modal.hide();
            
            // Open notification panel with user pre-filled
            document.getElementById('recipient').value = username;
            document.getElementById('recipientId').value = userId;
            document.getElementById('notificationPanel').classList.add('active');
            
            // Focus on subject field
            document.getElementById('subject').focus();
        });
    }
}

/**
 * Setup user deletion functionality
 */
function setupUserDeletion() {
    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    const deleteModal = document.getElementById('deleteUserModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (deleteButtons.length && deleteModal && confirmDeleteBtn) {
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const userId = this.getAttribute('data-user-id');
                const username = this.getAttribute('data-username');
                
                // Set delete modal content
                document.getElementById('deleteUsername').textContent = username;
                confirmDeleteBtn.setAttribute('data-user-id', userId);
                
                // Show modal
                const modal = new bootstrap.Modal(deleteModal);
                modal.show();
            });
        });
        
        // Handle confirmation
        confirmDeleteBtn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            
            // This would send a delete request to the server
            // For this demo, we'll just close the modal
            alert(`User deletion would be handled by the server API (User ID: ${userId})`);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(deleteModal);
            modal.hide();
        });
    }
}

/**
 * Calculate and display statistics
 */
function calculateStatistics() {
    // These would normally be calculated from real data
    // For this demo, we'll use placeholder data
    const statistics = {
        avgChatsPerUser: '3.2',
        avgMessagesPerChat: '12.5',
        avgInitialAnxietyScore: '13.2',
        avgCurrentAnxietyScore: '9.7',
        userRetentionRate: '68%',
        guestConversionRate: '42%',
        avgCheckpointsPerUser: '4.1',
        avgProgressPercentage: '58%'
    };
    
    // Update statistic elements if they exist
    Object.keys(statistics).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = statistics[key];
        }
    });
}
