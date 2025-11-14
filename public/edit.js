const API_BASE = window.location.origin;
let orgId = null;

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Load organization data
async function loadOrganization() {
    const urlParams = new URLSearchParams(window.location.search);
    orgId = urlParams.get('id');
    
    if (!orgId) {
        alert('No organization ID provided');
        window.location.href = '/view.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/organizations/${orgId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Organization not found');
        }
        
        const org = await response.json();
        populateForm(org);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('orgForm').style.display = 'block';
    } catch (error) {
        console.error('Error loading organization:', error);
        alert('Failed to load organization');
        window.location.href = '/view.html';
    }
}

// Populate form with organization data
function populateForm(org) {
    document.getElementById('name').value = org.Name || '';
    document.getElementById('abbreviation').value = org.Abbreviation || '';
    document.getElementById('operational-domain').value = org['Operational Domain'] || '';
    document.getElementById('website').value = org.Website || '';
    document.getElementById('email').value = org.Email || '';
    document.getElementById('social-media').value = org['Social Media'] || '';
    
    document.getElementById('country').value = org.Country || '';
    document.getElementById('city').value = org.City || '';
    document.getElementById('state').value = org['State/Province'] || '';
    document.getElementById('postal').value = org['Postal Code'] || '';
    document.getElementById('address1').value = org['Address Line 1'] || '';
    document.getElementById('address2').value = org['Address Line 2'] || '';
    document.getElementById('latitude').value = org.Latitude || '';
    document.getElementById('longitude').value = org.Longitude || '';
    document.getElementById('scope').value = org.Scope || '';
    document.getElementById('locations-countries').value = org['Locations/Countries'] || '';
    
    // Set regions (multi-select)
    if (org.Region && org.Region.length > 0) {
        const regionSelect = document.getElementById('region');
        Array.from(regionSelect.options).forEach(option => {
            option.selected = org.Region.includes(option.value);
        });
    }
    
    document.getElementById('overview').value = org.Overview || '';
    document.getElementById('key-activities').value = org['Key Activities'] || '';
    
    // Set focus areas (textarea)
    if (org.Focus && org.Focus.length > 0) {
        document.getElementById('focus').value = org.Focus.join('\n');
    }
    
    document.getElementById('notes').value = org.Notes || '';
    document.getElementById('flagged').checked = org['Flagged for Review'] || false;
    document.getElementById('flag-reason').value = org['Flag Reason'] || '';
}

// Handle form submission
document.getElementById('orgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Handle multi-select regions
    const regionSelect = document.getElementById('region');
    data.Region = Array.from(regionSelect.selectedOptions).map(option => option.value);
    
    // Handle focus areas (newline separated)
    const focusText = document.getElementById('focus').value;
    data.Focus = focusText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Handle checkbox
    data['Flagged for Review'] = document.getElementById('flagged').checked;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch(`${API_BASE}/api/organizations/${orgId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('✅ Organization updated successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/view.html';
            }, 1500);
        } else {
            throw new Error(result.error || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating organization:', error);
        showNotification('❌ ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Save Changes';
    }
});

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Initialize
(async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadOrganization();
    }
})();
