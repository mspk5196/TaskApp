const TaskDAO = require('../models/TaskDAO');

exports.createTask = async (req, res) => {
    try {
        const { title, description, type, score, closing_criteria, assignees } = req.body; // assignees is array of IDs
        const owner_id = req.user.id; 

        const taskId = await TaskDAO.createTask({
            title, description, owner_id, type, score, closing_criteria
        });

        if (assignees && assignees.length > 0) {
            for (const assigneeId of assignees) {
                await TaskDAO.assignTask(taskId, assigneeId);
            }
        }

        res.status(201).json({ message: 'Task created and assigned', id: taskId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

exports.respondToTask = async (req, res) => {
    try {
        const { taskId, status, reason } = req.body; // status: ACCEPTED / REJECTED
        const userId = req.user.id;

        await TaskDAO.updateAssignmentStatus(taskId, userId, status, reason);
        
        if (status === 'ACCEPTED') {
             await TaskDAO.updateTaskStatus(taskId, 'ACCEPTED'); 
             
             // MODULE C Integration: Place on Calendar
             // For MVP: We assume task has 'fixed' time (needs DB expansion) or we schedule it for 'Now' + 1hr 
             // SRS: "Calendar is locked until task acceptance".
             // We will create a slot for the user.
             
             // TODO: In real app, we fetch task details to get start/end time.
             // Here we just mock a 1-hour slot from now.
             
             const CalendarSlotDAO = require('../models/CalendarSlotDAO');
             const now = new Date();
             const end = new Date(now.getTime() + 60*60*1000);
             
             try {
                await CalendarSlotDAO.createSlot({
                    user_id: userId,
                    task_id: taskId,
                    start_time: now,
                    end_time: end,
                    type: 'TASK',
                    status: 'RESERVED'
                });
             } catch (slotError) {
                 console.warn('Auto-scheduling failed/conflict', slotError.message);
                 // In SRS, if conflict, user must resolve. Here we just warn.
             }
        }
        
        // MODULE T: Log Activity
        const ActionLogDAO = require('../models/ActionLogDAO');
        await ActionLogDAO.log({
            user_id: userId,
            entity_type: 'TASK',
            entity_id: taskId,
            action: `RESPONDED_${status}`,
            metadata: { reason }
        });

        res.status(200).json({ message: `Task ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to respond to task' });
    }
};

exports.getPendingTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await TaskDAO.findPendingTasksForUser(userId);
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending tasks' });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await TaskDAO.findAllTasksForUser(userId);
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId, status } = req.body; // STARTED, COMPLETED, FAILED
        const userId = req.user.id;
        
        // 1. Update Task Status
        await TaskDAO.updateTaskStatus(taskId, status);

        // 2. Log Action
        const ActionLogDAO = require('../models/ActionLogDAO');
        await ActionLogDAO.log({
            user_id: userId,
            entity_type: 'TASK',
            entity_id: taskId,
            action: `STATUS_CHANGE_${status}`
        });

        // 3. Update Score if Completed
        if (status === 'COMPLETED') {
             // MVP: Fixed 10 points
             const UserDAO = require('../models/UserDAO');
             await UserDAO.updateScore(userId, 10);
        }

        res.status(200).json({ message: `Task ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
