import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware factory.
 * Returns middleware that checks req.user.role against allowed roles.
 * Must be used after the `authenticate` middleware.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden. You do not have permission to access this resource.',
        requiredRoles: roles,
        yourRole: req.user.role,
      });
      return;
    }

    next();
  };
};
