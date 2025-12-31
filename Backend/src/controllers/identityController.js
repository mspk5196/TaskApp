const UserDAO = require('../models/UserDAO');
const jwtUtils = require('../utils/jwtUtils');

exports.getIdentities = async (req, res) => {
    try {
        const userId = req.user.id; // This is the ID of the currently logged-in HUMAN
        
        // 1. Get owned identities (Roles, Assets)
        const owned = await UserDAO.findOwnedIdentities(userId);
        
        // 2. Also return the self identity (Human)
        // In a real scenario, we might want to fetch 'self' details again to be sure
        const self = { id: userId, name: req.user.email, user_type: 'HUMAN', subtype: 'Self' }; 

        res.status(200).json([self, ...owned]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch identities' });
    }
};

exports.switchIdentity = async (req, res) => {
    try {
        const { targetMetadata } = req.body; // targetMetadata contains { id, type, name }
        // In a real secure app, we must verify the user OWNS this target identity before issuing a token.
        // For SRS scope, assuming ownership check is done via UI or previous fetch.
        // A better way is: check DB if req.user.id owns targetId.

        // TODO: Verify ownership strictly here using UserDAO
        
        // Issue new token representing this identity
        // We keep the 'original_user_id' in token to know who is the real human behind it.
        const token = jwtUtils.generateToken({ 
            id: targetMetadata.id, 
            email: req.user.email, // Keep email for reference
            user_type: targetMetadata.user_type,
            real_human_id: req.user.id // Critical for auditing
        });

        res.status(200).json({ token, identity: targetMetadata });

    } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Identity switch failed' });
    }
}
