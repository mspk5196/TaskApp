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
        } else if (type === 'SUBSCRIPTION') {
            if (!dailyQuotaMinutes) {
                return res.status(400).json({ error: 'Subscription requires quota (minutes)' });
            }
            // Treat dailyQuotaMinutes as the TOTAL quota for the subscription
            await TaskDAO.createTaskTimeRules({
                taskId, startDate, endDate: startDate, fixedStartTime: '00:00:00', fixedEndTime: '00:00:00', dailyQuotaMinutes
            });
        } else if (type === 'BIDDING') {
             // Update status to PENDING_BIDS so it shows up in a public/pool view
             await TaskDAO.updateTaskStatus(taskId, 'PENDING_BIDS');
        } else if (type === 'MEETING') {
             // Meeting specific logic:
             // 1. Roles: Assign Chair, Scribe? (MVP: Just standard assignment)
             // 2. We could auto-create a linked 'Minutes' document or subtask container.
        }

        res.status(201).json({ message: 'Task created', id: taskId });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create typed task' });
    }
};

// Implement Subscription and Bidding as extensions of createTypedTask or new methods
// We can handle them in the main createTypedTask if we add logic there.
// Let's UPDATE createTypedTask to handle them.

/*
        } else if (type === 'SUBSCRIPTION') {
             if (!dailyQuotaMinutes) {
                 return res.status(400).json({ error: 'Subscription requires quota (minutes)' });
             }
             await TaskDAO.createTaskTimeRules({
                 taskId, startDate, endDate, dailyQuotaMinutes // treating dailyQuota as Total Quota here
             });
        } else if (type === 'BIDDING') {
             // Bidding: Open to all (or specific group). Status -> PENDING_BIDS
             await TaskDAO.updateTaskStatus(taskId, 'PENDING_BIDS');
        }
*/

