const ClassLevelCA = require('../models/ClassLevelCA');

// ✅ Create or update CA setup for a class level
const saveCASetup = async (req, res) => {
  const transaction = await ClassLevelCA.sequelize.transaction(); // ✅ ensure atomic operation

  try {
    const { classLevel, caSetup } = req.body;
    const tenantId = req.user.tenantId; // ✅ tenant-based separation

    if (!classLevel || !Array.isArray(caSetup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: classLevel and caSetup array are required.',
      });
    }

    const results = [];

    // 🧮 Loop through each CA entry and upsert
    for (const ca of caSetup) {
      if (!ca.caption || ca.maxScore == null) continue;

      const [record, created] = await ClassLevelCA.upsert(
        {
          id: ca.id || undefined, // ✅ allow update if ID exists
          tenantId,
          classLevel,
          caption: ca.caption,
          maxScore: ca.maxScore,
          enabled: ca.enabled ?? true,
        },
        {
          returning: true,
          transaction,
        }
      );

      // 🧾 Push detailed info for response
      results.push({
        id: record.id,
        caption: record.caption,
        maxScore: record.maxScore,
        enabled: record.enabled,
        classLevel: record.classLevel,
        tenantId: record.tenantId,
        created: created,
      });
    }

    await transaction.commit();

    // ✅ Send detailed response
    return res.status(200).json({
      success: true,
      message: 'CA setup saved successfully for class level',
      data: results,
      count: results.length,
    });
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Error in saveCASetup:', err);
    return res.status(500).json({
      success: false,
      message: 'Error saving CA setup',
      error: err.message,
    });
  }
};

// ✅ Get CA setup for a specific class level

const getCASetup = async (req, res) => {
  try {
    const { classLevel } = req.params;
    const tenantId = req.user.tenantId;

    console.log('🔍 Fetching CA setup for:', { tenantId, classLevel });

    const caSetup = await ClassLevelCA.findAll({
      where: { tenantId, classLevel },
      order: [['id', 'ASC']]
    });

    if (!caSetup.length) {
      return res.status(404).json({
        success: false,
        message: `No CA setup found for class level "${classLevel}"`,
        data: [],
        count: 0
      });
    }

    const formattedData = caSetup.map(ca => ({
      id: ca.id,
      caption: ca.caption,
      maxScore: ca.maxScore,
      enabled: ca.enabled,
      classLevel: ca.classLevel,
      created: ca.createdAt || null
    }));

    res.status(200).json({
      success: true,
      message: `CA setup retrieved successfully for class level "${classLevel}"`,
      data: formattedData,
      count: formattedData.length
    });
  } catch (err) {
    console.error('❌ Error in getCASetup:', err.message);
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching CA setup',
      data: [],
      count: 0
    });
  }
};

// ✅ Update a specific CA record
// Update a specific CA setup record by ID
const updateCASetup = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const { caption, maxScore, enabled } = req.body;

    // Check for required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'CA setup ID is required'
      });
    }

    // Find the CA record belonging to this tenant
    const caRecord = await ClassLevelCA.findOne({
      where: { id, tenantId }
    });

    if (!caRecord) {
      return res.status(404).json({
        success: false,
        message: `CA setup with ID ${id} not found for this tenant`
      });
    }

    // Update the CA record
    caRecord.caption = caption ?? caRecord.caption;
    caRecord.maxScore = maxScore ?? caRecord.maxScore;
    caRecord.enabled = enabled ?? caRecord.enabled;

    await caRecord.save();

    // Response with updated data
    res.status(200).json({
      success: true,
      message: 'CA setup updated successfully',
      data: [
        {
          id: caRecord.id,
          caption: caRecord.caption,
          maxScore: caRecord.maxScore,
          enabled: caRecord.enabled,
          classLevel: caRecord.classLevel,
          created: caRecord.createdAt || null
        }
      ],
      count: 1
    });
  } catch (err) {
    console.error('❌ Error in updateCASetup:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating CA setup'
    });
  }
};

module.exports = { saveCASetup, getCASetup, updateCASetup };
