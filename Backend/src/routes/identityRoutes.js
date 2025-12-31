const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', identityController.getIdentities);
router.post('/switch', identityController.switchIdentity);

module.exports = router;
