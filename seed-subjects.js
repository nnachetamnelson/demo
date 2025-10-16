// Seed script to create initial subjects for schools
require('dotenv').config();
const { sequelize } = require('./shared/db/models');
const Subject = require('./shared/models/Subject');

const commonSubjects = [
  'Mathematics',
  'English Language',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'Foreign Language',
  'Economics',
  'Literature'
];

async function seedSubjects(tenantId) {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if subjects already exist for this tenant
    const existing = await Subject.count({ where: { tenantId } });
    
    if (existing > 0) {
      console.log(`ℹ️  ${existing} subjects already exist for tenant: ${tenantId}`);
      return;
    }

    // Create subjects
    const subjects = commonSubjects.map(name => ({
      tenantId,
      name,
    }));

    await Subject.bulkCreate(subjects);
    console.log(`✅ Created ${subjects.length} subjects for tenant: ${tenantId}`);
    
    // Display created subjects
    const created = await Subject.findAll({ 
      where: { tenantId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    console.log('\nSubjects created:');
    created.forEach(s => console.log(`  - ${s.id}: ${s.name}`));

  } catch (error) {
    console.error('❌ Error seeding subjects:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Get tenant ID from command line argument
const tenantId = process.argv[2];

if (!tenantId) {
  console.error('❌ Usage: node seed-subjects.js <tenantId>');
  console.error('   Example: node seed-subjects.js school1');
  process.exit(1);
}

seedSubjects(tenantId);
