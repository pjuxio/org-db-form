const API_BASE = window.location.origin;
let allOrganizations = [];
let currentUser = null;
let currentOrg = null;

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        const authSection = document.getElementById('authSection');
        
        if (data.authenticated) {
            currentUser = data.user;
            authSection.innerHTML = `
                <div style="font-size: 14px; color: #666;">
                    <span>👤 ${data.user.name} (${data.user.role})</span>
                    <button onclick="logout()" style="margin-left: 10px; padding: 5px 15px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <a href="/login.html" style="padding: 8px 20px; background: #2c5f2d; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Login</a>
            `;
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

// Logout function
async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, { 
            method: 'POST',
            credentials: 'include'
        });
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout');
    }
}

// Load and display organizations
async function loadOrganizations() {
    try {
        const response = await fetch(`${API_BASE}/api/organizations`);
        const data = await response.json();
        
        allOrganizations = data;
        displayOrganizations(data);
        updateStats(data);
        
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error loading organizations:', error);
        document.getElementById('loading').textContent = 'Failed to load organizations';
    }
}

// Display organizations
function displayOrganizations(organizations) {
    const grid = document.getElementById('org-grid');
    
    if (organizations.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666;">No organizations found</p>';
        return;
    }
    
    grid.innerHTML = organizations.map(org => `
        <div class="org-card" onclick='openModal(${JSON.stringify(org).replace(/'/g, "&apos;")})'>
            <h3>${org.Name || 'Unnamed Organization'}</h3>
            ${org.Abbreviation ? `<p><strong>Abbreviation:</strong> ${org.Abbreviation}</p>` : ''}
            ${org.Country ? `<p><strong>Country:</strong> ${org.Country}</p>` : ''}
            ${org.Website ? `<p><a href="${org.Website}" target="_blank" class="website" onclick="event.stopPropagation()">🔗 Website</a></p>` : ''}
            ${org.Overview ? `<p class="overview">${truncate(org.Overview, 150)}</p>` : ''}
            ${org.Region && org.Region.length > 0 ? `
                <div style="margin-top: 10px;">
                    ${org.Region.map(r => `<span class="region">${r}</span>`).join('')}
                </div>
            ` : ''}
            ${org['Flagged for Review'] ? '<p style="color: #d32f2f; font-weight: 600; margin-top: 10px;">⚠️ Flagged for Review</p>' : ''}
            <button class="view-details-btn" onclick="event.stopPropagation(); openModal(${JSON.stringify(org).replace(/'/g, "&apos;")})">View Full Details</button>
        </div>
    `).join('');
}

// Modal functions
function openModal(org) {
    currentOrg = org;
    const modal = document.getElementById('orgModal');
    const content = document.getElementById('modalContent');
    
    const editButton = currentUser ? `
        <button onclick="editOrganization()" style="padding: 10px 20px; background: #2c5f2d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; margin-left: 10px;">
            ✏️ Edit
        </button>
    ` : '';
    
    const historyButton = currentUser ? `
        <button onclick="viewHistory()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; margin-left: 10px;">
            📜 History
        </button>
    ` : '';
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>${org.Name || 'Unnamed Organization'}</h2>
            <div>
                ${historyButton}
                ${editButton}
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
        </div>
        <div class="modal-body">
            ${renderField('ID', org.ID)}
            ${renderField('Abbreviation', org.Abbreviation)}
            ${renderField('Operational Domain', org['Operational Domain'])}
            ${renderField('Scope', org.Scope)}
            ${renderField('Website', org.Website, true)}
            ${renderField('Email', org.Email)}
            ${renderField('Social Media', org['Social Media'])}
            
            <h3 class="section-title">Location</h3>
            ${renderField('Country', org.Country)}
            ${renderField('City', org.City)}
            ${renderField('State/Province', org['State/Province'])}
            ${renderField('Postal Code', org['Postal Code'])}
            ${renderField('Address Line 1', org['Address Line 1'])}
            ${renderField('Address Line 2', org['Address Line 2'])}
            ${renderField('Latitude', org.Latitude)}
            ${renderField('Longitude', org.Longitude)}
            ${renderArrayField('Region', org.Region)}
            ${renderField('Locations/Countries', org['Locations/Countries'])}
            
            <h3 class="section-title">Organization Details</h3>
            ${renderField('Overview', org.Overview, false, true)}
            ${renderField('Key Activities', org['Key Activities'], false, true)}
            ${renderArrayField('Focus', org.Focus)}
            ${renderField('Notes', org.Notes, false, true)}
            
            <h3 class="section-title">Review Status</h3>
            ${renderBooleanField('Flagged for Review', org['Flagged for Review'])}
            ${renderField('Flag Reason', org['Flag Reason'])}
            ${renderField('Empty Org?', org['Empty Org?'])}
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('orgModal').style.display = 'none';
}

function renderField(label, value, isLink = false, isTextarea = false) {
    if (!value || (Array.isArray(value) && value.length === 0)) return '';
    
    if (isLink && value) {
        return `
            <div class="modal-field">
                <strong>${label}:</strong>
                <a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>
            </div>
        `;
    }
    
    if (isTextarea) {
        return `
            <div class="modal-field">
                <strong>${label}:</strong>
                <div class="modal-textarea">${value}</div>
            </div>
        `;
    }
    
    return `
        <div class="modal-field">
            <strong>${label}:</strong> ${value}
        </div>
    `;
}

function renderArrayField(label, values) {
    if (!values || values.length === 0) return '';
    
    return `
        <div class="modal-field">
            <strong>${label}:</strong>
            <div class="modal-tags">
                ${values.map(v => `<span class="modal-tag">${v}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderBooleanField(label, value) {
    const icon = value ? '✅' : '❌';
    const text = value ? 'Yes' : 'No';
    return `
        <div class="modal-field">
            <strong>${label}:</strong> ${icon} ${text}
        </div>
    `;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orgModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Update statistics
function updateStats(organizations) {
    const count = organizations.length;
    const withWebsite = organizations.filter(o => o.Website).length;
    const flagged = organizations.filter(o => o['Flagged for Review']).length;
    
    document.getElementById('org-count').textContent = 
        `${count} organizations | ${withWebsite} with website | ${flagged} flagged for review`;
}

// Truncate text
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Search functionality
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        displayOrganizations(allOrganizations);
        updateStats(allOrganizations);
        return;
    }
    
    const filtered = allOrganizations.filter(org => {
        return (
            org.Name?.toLowerCase().includes(searchTerm) ||
            org.Country?.toLowerCase().includes(searchTerm) ||
            org.Region?.some(r => r.toLowerCase().includes(searchTerm)) ||
            org['Operational Domain']?.toLowerCase().includes(searchTerm)
        );
    });
    
    displayOrganizations(filtered);
    updateStats(filtered);
});

// Edit organization
function editOrganization() {
    if (!currentOrg) return;
    window.location.href = `/edit.html?id=${currentOrg.ID}`;
}

// View history
function viewHistory() {
    if (!currentOrg) return;
    window.location.href = `/history.html?id=${currentOrg.ID}`;
}

// Load on page load
checkAuth();
loadOrganizations();
