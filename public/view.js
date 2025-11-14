const API_BASE = window.location.origin;
let allOrganizations = [];

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
        <div class="org-card">
            <h3>${org.Name || 'Unnamed Organization'}</h3>
            ${org.Abbreviation ? `<p><strong>Abbreviation:</strong> ${org.Abbreviation}</p>` : ''}
            ${org.Country ? `<p><strong>Country:</strong> ${org.Country}</p>` : ''}
            ${org.Website ? `<p><a href="${org.Website}" target="_blank" class="website">🔗 Website</a></p>` : ''}
            ${org.Overview ? `<p class="overview">${truncate(org.Overview, 150)}</p>` : ''}
            ${org.Region && org.Region.length > 0 ? `
                <div style="margin-top: 10px;">
                    ${org.Region.map(r => `<span class="region">${r}</span>`).join('')}
                </div>
            ` : ''}
            ${org['Flagged for Review'] ? '<p style="color: #d32f2f; font-weight: 600; margin-top: 10px;">⚠️ Flagged for Review</p>' : ''}
        </div>
    `).join('');
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

// Load on page load
loadOrganizations();
