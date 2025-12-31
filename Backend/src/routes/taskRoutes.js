const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protect all routes

const taskTypeController = require('../controllers/taskTypeController');

router.post('/', taskController.createTask);
router.post('/typed', taskTypeController.createTypedTask);
router.get('/', taskController.getMyTasks);
router.get('/pending', taskController.getPendingTasks);
router.post('/respond', taskController.respondToTask);
router.post('/status', taskController.updateTaskStatus);

module.exports = router;
