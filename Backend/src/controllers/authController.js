const UserDAO = require('../models/UserDAO');
const AuthIdentityDAO = require('../models/AuthIdentityDAO');
const jwtUtils = require('../utils/jwtUtils');

exports.register = async (req, res) => {
  try {
    const { name, email, password, type = 'HUMAN', subtype = 'Student' } = req.body;

    // TODO: Check if email exists first (omitted for brevity, assume strict checks later)
    
    // 1. Create User
    const userId = await UserDAO.createUser({
      type,
      subtype,
      name
    });

    // 2. Create Auth Identity
    const identityId = await AuthIdentityDAO.createIdentity({
      user_id: userId,
      provider: 'PASSWORD',
      provider_uid: null, // Identity is tied to email for password auth
      email,
      is_primary: true
    });

    // 3. Create Password
    await AuthIdentityDAO.createPassword({
      identity_id: identityId,
      password
    });

    // 4. Generate Token
    const token = jwtUtils.generateToken({ id: userId, email, user_type: type });

    res.status(201).json({ message: 'User registered', token, user: { id: userId, name, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find Identity
    const identity = await AuthIdentityDAO.findByEmail(email);
    if (!identity) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Verify Password
    const isValid = await AuthIdentityDAO.verifyPassword(identity.id, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate Token
    const token = jwtUtils.generateToken({ 
      id: identity.user_id, 
      email: identity.email, 
      user_type: identity.user_type 
    });

    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: identity.user_id, 
        name: identity.name, 
        email: identity.email,
        type: identity.user_type
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};
