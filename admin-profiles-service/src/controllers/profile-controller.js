const Profile = require('../models/Profile');
const logger = require('../utils/logger');
const { validateUpdateProfile } = require('../utils/validation');

const syncProfile = async (req, res) => {
  try {
    const { userId, tenantId, email, username, role } = req.body;
    if (!userId || !tenantId) {
      logger.warn('Missing userId or tenantId', { userId, tenantId });
      return res.status(400).json({ success: false, message: 'Missing userId or tenantId' });
    }

    const existingProfile = await Profile.findOne({ where: { userId, tenantId } });
    if (existingProfile) {
      logger.info('Profile already exists', { userId, tenantId });
      return res.status(200).json({ success: true, message: 'Profile exists', data: existingProfile });
    }

    const newProfile = await Profile.create({
      userId,
      tenantId,
      email,
      username,
      role: role || 'student',
      bio: '',
      profilePicture: null,
    });

    logger.info('Profile created via sync', { userId, tenantId });
    res.status(201).json({ success: true, message: 'Profile created', data: newProfile });
  } catch (error) {
    logger.error('Error syncing profile', error);
    res.status(500).json({ success: false, message: 'Error syncing profile' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
    if (isNaN(userId) || !tenantId) {
      logger.warn('Invalid userId or tenantId', { userId, tenantId });
      return res.status(400).json({ success: false, message: 'Invalid userId or tenantId' });
    }

    const profile = await Profile.findOne({ where: { userId, tenantId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { error } = validateUpdateProfile(req.body);
    if (error) {
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const userId = parseInt(req.params.userId, 10);
    const tenantId = req.user.tenantId || req.headers['x-tenant-id'];
    if (isNaN(userId) || !tenantId) {
      logger.warn('Invalid userId or tenantId', { userId, tenantId });
      return res.status(400).json({ success: false, message: 'Invalid userId or tenantId' });
    }

    const { bio, profilePicture, role } = req.body;
    const profile = await Profile.findOne({ where: { userId, tenantId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.profilePicture = profilePicture !== undefined ? profilePicture : profile.profilePicture;
    profile.role = role !== undefined ? role : profile.role;
    await profile.save();

    logger.info('Profile updated', { userId, tenantId });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    logger.error('Error updating profile', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

module.exports = { getProfile, updateProfile, syncProfile };