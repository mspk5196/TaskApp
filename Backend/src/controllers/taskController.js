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
             // Check for conflict first
             const isConflict = await CalendarSlotDAO.checkConflict(userId, now, end);
             
             if (isConflict) {
                 // SRS 2.3: A task cannot be accepted if calendar slot is occupied.
                 // For MVP, we simply reject the acceptance (or error out).
                 // In full app, we'd prompt user to Resolve/Reschedule.
                 return res.status(409).json({ error: 'Calendar Conflict: Slot occupied. Resolve conflict first.' });
             }

             try {
                await CalendarSlotDAO.createSlot({
                    user_id: userId,
                    task_id: taskId,
                    start_time: now,
                    end_time: end,
                    type: 'TASK',
                    status: 'RESERVED'
                });
                
                // Only update status if slot created successfully
                await TaskDAO.updateTaskStatus(taskId, 'ACCEPTED'); 
             } catch (slotError) {
                 console.warn('Auto-scheduling failed', slotError.message);
                 return res.status(500).json({ error: 'Failed to place on calendar' });
             }
        } else {
            // If REJECTED, just update status
            // Logic for REJECTED is missing in original snippet context, but assuming we handle it.
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

             // Check if this task is part of a package and activate next
             const PackageTaskDAO = require('../models/PackageTaskDAO');
             await PackageTaskDAO.checkAndActivateNext(taskId);
        }

        res.status(200).json({ message: `Task ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

exports.refreshStatus = async (req, res) => {
    try {
        await TaskDAO.updateOverdueTasks();
        res.status(200).json({ message: 'Statuses refreshed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to refresh status' });
    }
};
