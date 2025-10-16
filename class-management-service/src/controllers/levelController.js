const Level = require('../models/Level');

const createLevel = async (req, res) => {
  try {
    const {  name, category } = req.body;
    const tenantId = req.user.tenantId;

    if (!tenantId || !name || !category) {
      return res.status(400).json({ success: false, message: 'tenantId, name, and category are required.' });
    }

    const exists = await Level.findOne({ where: { tenantId, name } });
    if (exists) {
      return res.status(400).json({ success: false, message: `Level '${name}' already exists for this tenant.` });
    }

    const level = await Level.create({ tenantId, name, category });

    return res.status(201).json({
      success: true,
      message: 'Level created successfully.',
      data: level,
    });
  } catch (err) {
    console.error('Error creating level:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
const getAllLevels = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const levels = await Level.findAll({ where: { tenantId }, order: [['name', 'ASC']] });
    res.json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching levels' });
  }
};
// ✅ UPDATE a level by ID
const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    await level.update({ name, category });

    return res.status(200).json({
      message: 'Level updated successfully',
      level,
    });
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ DELETE a level by ID
const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    await level.destroy();

    return res.status(200).json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createLevel,
  getAllLevels,
  updateLevel,
  deleteLevel,
};