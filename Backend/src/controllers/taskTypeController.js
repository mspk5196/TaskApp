const TaskDAO = require('../models/TaskDAO');
const CalendarSlotDAO = require('../models/CalendarSlotDAO');

// Validates and Creates specific task types
exports.createTypedTask = async (req, res) => {
    try {
        const { title, description, type, score, closing_criteria, assignees, 
                // Type specific fields
                startDate, endDate, fixedStartTime, fixedEndTime, dailyQuotaMinutes 
              } = req.body;
        
        const owner_id = req.user.id;

        // 1. Create Base Task
        const taskId = await TaskDAO.createTask({
            title, description, owner_id, type, score, closing_criteria
        });

        // 2. Assign Users
        if (assignees && assignees.length > 0) {
            for (const assigneeId of assignees) {
                await TaskDAO.assignTask(taskId, assigneeId);
            }
        }

        // 3. Handle Type Specific Logic
        if (type === 'FIXED') {
            if (!startDate || !fixedStartTime || !fixedEndTime) {
                return res.status(400).json({ error: 'Fixed tasks require startDate, startTime, and endTime' });
            }
            // Add to time rules
            await TaskDAO.createTaskTimeRules({
                taskId, startDate, endDate: startDate, fixedStartTime, fixedEndTime
            });
            
            // NOTE: We do NOT auto-place on calendar yet. SRS says "Calendar is locked until task acceptance".
            // So we just define the rules.
        } else if (type === 'FLOATING') {
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Floating tasks require start and end date' });
            }
            await TaskDAO.createTaskTimeRules({
                taskId, startDate, endDate
            });
        }

        res.status(201).json({ message: 'Task created', id: taskId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create typed task' });
    }
};
