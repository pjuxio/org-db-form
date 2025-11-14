// Script to import your existing JSON data into MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Organization Schema (same as server.js)
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

async function importData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📖 Reading JSON file...');
    const jsonPath = path.join(__dirname, 'data', 'source.json');
    const data = await fs.readFile(jsonPath, 'utf8');
    const organizations = JSON.parse(data);
    
    console.log(`📊 Found ${organizations.length} organizations to import`);

    // Clean up data - convert empty strings to appropriate values
    const cleanedOrgs = organizations.map(org => {
      const cleaned = { ...org };
      // Convert empty string to false for boolean field
      if (cleaned['Flagged for Review'] === '' || cleaned['Flagged for Review'] === undefined) {
        cleaned['Flagged for Review'] = false;
      }
      return cleaned;
    });

    console.log('🗑️  Clearing existing data...');
    await Organization.deleteMany({});

    console.log('💾 Importing organizations...');
    const result = await Organization.insertMany(cleanedOrgs);
    
    console.log(`✅ Successfully imported ${result.length} organizations!`);
    console.log('\n🎉 Import complete!');
    
    // Show some stats
    const count = await Organization.countDocuments();
    const withWebsite = await Organization.countDocuments({ Website: { $ne: '' } });
    const flagged = await Organization.countDocuments({ "Flagged for Review": true });
    
    console.log('\n📈 Database Stats:');
    console.log(`   Total organizations: ${count}`);
    console.log(`   With website: ${withWebsite}`);
    console.log(`   Flagged for review: ${flagged}`);
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
}

importData();
