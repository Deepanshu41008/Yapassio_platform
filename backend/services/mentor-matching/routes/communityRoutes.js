const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const Group = require('../../../models/Group');
const User = require('../../../models/User');

// Get all public groups with filters
router.get('/', async (req, res) => {
  try {
    const { domain, location, page = 1, limit = 10, sortBy = 'members' } = req.query;
    let query = { active: true, 'settings.isPublic': true };

    if (domain) query.domain = domain;
    if (location) query['$or'] = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
        { 'location.isOnline': true }
    ];

    let sortOptions = {};
    switch (sortBy) {
      case 'members': sortOptions = { 'stats.totalMembers': -1 }; break;
      case 'newest': sortOptions = { createdAt: -1 }; break;
      default: sortOptions = { 'stats.totalMembers': -1 };
    }

    const skip = (page - 1) * limit;
    const groups = await Group.find(query).populate('createdBy', 'name').sort(sortOptions).skip(skip).limit(parseInt(limit));
    const total = await Group.countDocuments(query);

    res.json({
      success: true,
      groups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalGroups: total
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups', message: error.message });
  }
});

// Get single group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members.user', 'name');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json({ success: true, group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group', message: error.message });
  }
});

// Create new group
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, domain, settings } = req.body;
    const group = new Group({
      name,
      description,
      domain,
      settings,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }],
      'stats.totalMembers': 1,
      'stats.activeMembers': 1
    });
    await group.save();
    res.status(201).json({ success: true, message: 'Group created successfully', groupId: group._id });
  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ error: 'Failed to create group', message: error.message });
  }
});

// Update group
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, domain, settings } = req.body;
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Check if user is the creator/admin
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'User not authorized to update this group' });
        }

        group.name = name || group.name;
        group.description = description || group.description;
        group.domain = domain || group.domain;
        group.settings = settings || group.settings;

        await group.save();
        res.json({ success: true, message: 'Group updated successfully', group });
    } catch (error) {
        console.error('Group update error:', error);
        res.status(500).json({ error: 'Failed to update group', message: error.message });
    }
});

// Delete group
router.delete('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Check if user is the creator/admin
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'User not authorized to delete this group' });
        }

        await group.remove();
        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Group delete error:', error);
        res.status(500).json({ error: 'Failed to delete group', message: error.message });
    }
});

// Join group
router.post('/:id/join', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.some(m => m.user.toString() === req.user.id);
    if (isMember) return res.status(400).json({ error: 'Already a member of this group' });

    if (group.members.length >= group.settings.maxMembers) {
      return res.status(400).json({ error: 'Group is full' });
    }

    group.members.push({ user: req.user.id });
    group.stats.totalMembers += 1;
    group.stats.activeMembers += 1;
    await group.save();

    res.json({ success: true, message: 'Successfully joined group' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group', message: error.message });
  }
});

// Leave group
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const memberIndex = group.members.findIndex(m => m.user.toString() === req.user.id);
    if (memberIndex === -1) return res.status(400).json({ error: 'Not a member of this group' });

    // Prevent leaving if user is the only admin
    const member = group.members[memberIndex];
    if (member.role === 'admin') {
      const otherAdmins = group.members.filter(m => m.role === 'admin' && m.user.toString() !== req.user.id);
      if (otherAdmins.length === 0) {
        return res.status(400).json({ error: 'Cannot leave - you are the only admin. Please assign another admin first.' });
      }
    }

    group.members.splice(memberIndex, 1);
    group.stats.totalMembers -= 1;
    group.stats.activeMembers -= 1;
    await group.save();

    res.json({ success: true, message: 'Successfully left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group', message: error.message });
  }
});

module.exports = router;
