const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { OrganizerApplication } = require('../models');

router.use(protect);

router.post('/apply', async (req, res) => {
  try {
    const existing = await OrganizerApplication.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ success: false, message: 'Application already submitted' });
    const app = await OrganizerApplication.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my-application', async (req, res) => {
  try {
    const app = await OrganizerApplication.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
