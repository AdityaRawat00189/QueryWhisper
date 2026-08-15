import User from "../schemas/user.schema.js";

const requireAuth = async (req, res, next) => {
  try {
    // 1. Safe Check: Ensure req.session itself exists before checking userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    
    // 2. Database Validation: Ensure the user hasn't been deleted or banned
    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user) {
      // The cookie is valid, but the user was deleted from the DB!
      // Destroy the zombie session and clear the cookie.
      req.session.destroy();
      res.clearCookie('connect.sid'); // 'connect.sid' is the default name unless you changed it in config
      return res.status(401).json({ error: 'User account no longer exists. Please register again.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    // 3. Convenience: Attach the user to the request object
    // This allows your routes to easily access req.user.email or req.user.username 
    // without having to query the database again in every single route.
    req.user = user;
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ error: "Internal server error during authentication check." });
  }
};

export default requireAuth;