require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Organization Schema
const organizationSchema = new mongoose.Schema({
  ID: { type: String, required: true, unique: true },
  Name: String,
  Abbreviation: String,
  "Operational Domain": String,
  Scope: String,
  Website: String,
  City: String,
  "State/Province": String,
  "Postal Code": String,
  Country: String,
  "Address Line 1": String,
  "Address Line 2": String,
  Latitude: String,
  Longitude: String,
  Focus: [String],
  Overview: String,
  "Key Activities": String,
  Region: [String],
  "Locations/Countries": String,
  "Flagged for Review": { type: Boolean, default: false },
  "Flag Reason": String,
  Email: String,
  "Social Media": String,
  Notes: String,
  "Empty Org?": String
}, { 
  collection: 'organizations',
  timestamps: true 
});

const Organization = mongoose.model('Organization', organizationSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Routes

// Get all organizations (returns JSON array)
app.get('/api/organizations', async (req, res) => {
  try {
    const orgs = await Organization.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
    res.json(orgs);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get single organization by ID
app.get('/api/organizations/:id', async (req, res) => {
  try {
    const org = await Organization.findOne({ ID: req.params.id }, { _id: 0, __v: 0 }).lean();
    if (org) {
      res.json(org);
    } else {
      res.status(404).json({ error: 'Organization not found' });
    }
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Create new organization
app.post('/api/organizations', async (req, res) => {
  try {
    const orgData = {
      ID: `org_${uuidv4().replace(/-/g, '')}`,
      Name: req.body.Name || '',
      Abbreviation: req.body.Abbreviation || '',
      "Operational Domain": req.body["Operational Domain"] || '',
      Scope: req.body.Scope || '',
      Website: req.body.Website || '',
      City: req.body.City || '',
      "State/Province": req.body["State/Province"] || '',
      "Postal Code": req.body["Postal Code"] || '',
      Country: req.body.Country || '',
      "Address Line 1": req.body["Address Line 1"] || '',
      "Address Line 2": req.body["Address Line 2"] || '',
      Latitude: req.body.Latitude || '',
      Longitude: req.body.Longitude || '',
      Focus: Array.isArray(req.body.Focus) ? req.body.Focus : [],
      Overview: req.body.Overview || '',
      "Key Activities": req.body["Key Activities"] || '',
      Region: Array.isArray(req.body.Region) ? req.body.Region : [],
      "Locations/Countries": req.body["Locations/Countries"] || '',
      "Flagged for Review": req.body["Flagged for Review"] || false,
      "Flag Reason": req.body["Flag Reason"] || '',
      Email: req.body.Email || '',
      "Social Media": req.body["Social Media"] || '',
      Notes: req.body.Notes || '',
      "Empty Org?": req.body["Empty Org?"] || ''
    };
    
    const newOrg = new Organization(orgData);
    await newOrg.save();
    
    // Return without MongoDB fields
    const response = newOrg.toObject();
    delete response._id;
    delete response.__v;
    delete response.createdAt;
    delete response.updatedAt;
    
    res.status(201).json({ 
      success: true, 
      message: 'Organization created successfully',
      organization: response 
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Update organization
app.put('/api/organizations/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.ID; // Don't allow ID changes
    delete updateData._id;
    
    const org = await Organization.findOneAndUpdate(
      { ID: req.params.id },
      updateData,
      { new: true, select: '-_id -__v -createdAt -updatedAt' }
    ).lean();
    
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Organization updated successfully',
      organization: org 
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Delete organization
app.delete('/api/organizations/:id', async (req, res) => {
  try {
    const result = await Organization.deleteOne({ ID: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Organization deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// Export all data as JSON (for your frontend)
app.get('/api/export', async (req, res) => {
  try {
    const orgs = await Organization.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=organizations.json');
    res.json(orgs);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Bulk import endpoint (to import your existing data)
app.post('/api/import', async (req, res) => {
  try {
    const organizations = req.body;
    
    if (!Array.isArray(organizations)) {
      return res.status(400).json({ error: 'Expected an array of organizations' });
    }
    
    // Clear existing data (optional - remove if you want to append)
    // await Organization.deleteMany({});
    
    // Insert all organizations
    const result = await Organization.insertMany(organizations, { ordered: false });
    
    res.json({ 
      success: true, 
      message: `Imported ${result.length} organizations`,
      count: result.length
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the form at: http://localhost:${PORT}`);
});
