// API Base URL - works locally and on Heroku
const API_BASE = window.location.origin;

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Handle form submission
document.getElementById('orgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Process form data
    for (let [key, value] of formData.entries()) {
        if (key === 'Focus') {
            // Split focus areas by newline
            data[key] = value.split('\n').filter(item => item.trim()).map(item => item.trim());
        } else if (key === 'Region') {
            // Region is already an array from select multiple
            data[key] = formData.getAll(key);
        } else if (key === 'Flagged for Review') {
            data[key] = true;
        } else {
            data[key] = value;
        }
    }
    
    // Handle checkbox if not checked
    if (!data['Flagged for Review']) {
        data['Flagged for Review'] = false;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('✅ Organization added successfully!', 'success');
            e.target.reset();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showNotification(`❌ Error: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Failed to submit. Please try again.', 'error');
    }
});

// Handle reset
document.getElementById('orgForm').addEventListener('reset', () => {
    setTimeout(() => {
        showNotification('Form cleared', 'success');
    }, 100);
});
