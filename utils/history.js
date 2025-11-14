const OrganizationHistory = require('../models/OrganizationHistory');

// Calculate differences between two objects
function calculateChanges(oldData, newData) {
  const changes = {};
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  for (const key of allKeys) {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    
    // Skip metadata fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'].includes(key)) {
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
      const oldArr = Array.isArray(oldValue) ? oldValue : [];
      const newArr = Array.isArray(newValue) ? newValue : [];
      
      if (JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
        changes[key] = {
          from: oldArr,
          to: newArr
        };
      }
      continue;
    }
    
    // Handle other values
    if (oldValue !== newValue) {
      changes[key] = {
        from: oldValue || null,
        to: newValue || null
      };
    }
  }
  
  return changes;
}

// Save a version to history
async function saveVersion(organizationId, action, data, oldData, userEmail) {
  try {
    // Get the latest version number
    const latestVersion = await OrganizationHistory
      .findOne({ organizationId })
      .sort({ version: -1 })
      .select('version')
      .lean();
    
    const version = (latestVersion?.version || 0) + 1;
    
    // Calculate changes for updates
    const changes = action === 'updated' ? calculateChanges(oldData, data) : null;
    
    // Clean data for storage (remove MongoDB fields)
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.__v;
    
    const historyEntry = new OrganizationHistory({
      organizationId,
      version,
      action,
      data: cleanData,
      changes,
      changedBy: userEmail,
      timestamp: new Date()
    });
    
    await historyEntry.save();
    return historyEntry;
  } catch (error) {
    console.error('Error saving version:', error);
    throw error;
  }
}

// Get full history for an organization
async function getHistory(organizationId) {
  try {
    return await OrganizationHistory
      .find({ organizationId })
      .sort({ version: -1 })
      .lean();
  } catch (error) {
    console.error('Error getting history:', error);
    throw error;
  }
}

// Get a specific version
async function getVersion(organizationId, version) {
  try {
    return await OrganizationHistory
      .findOne({ organizationId, version })
      .lean();
  } catch (error) {
    console.error('Error getting version:', error);
    throw error;
  }
}

// Get latest version number
async function getLatestVersion(organizationId) {
  try {
    const latest = await OrganizationHistory
      .findOne({ organizationId })
      .sort({ version: -1 })
      .select('version')
      .lean();
    
    return latest?.version || 0;
  } catch (error) {
    console.error('Error getting latest version:', error);
    return 0;
  }
}

module.exports = {
  saveVersion,
  getHistory,
  getVersion,
  getLatestVersion,
  calculateChanges
};
