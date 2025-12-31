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
router.get('/refresh-status', taskController.refreshStatus);

const roleController = require('../controllers/roleController');
router.post('/roles/assign', roleController.assignRole);
router.post('/roles/respond', roleController.respondToRoleAssignment);

// Module 7
const notificationRoutes = require('../routes/notificationRoutes');
router.use('/notifications', notificationRoutes); // Nested if we want, but app.js handles it. 
// Actually app.js handles /api/notifications. 
// Let's keep reports here or new route.
const performanceController = require('../controllers/performanceController');
router.get('/reports/performance', performanceController.getPerformanceReport);

const closureController = require('../controllers/closureController');
router.post('/closure/otp/generate', closureController.generateOTP);
router.post('/closure/otp/verify', closureController.verifyOTP);
router.post('/closure/photo', closureController.uploadPhoto);
router.get('/penalties', closureController.getPenalties);
router.post('/penalties/calculate', closureController.runPenaltyCalculation);

module.exports = router;

