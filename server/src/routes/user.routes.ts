import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getAllUsers, updateUserRole } from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

// Only ADMIN can access these routes
router.get('/', requireRole(['ADMIN']), getAllUsers);
router.put('/:id/role', requireRole(['ADMIN']), updateUserRole);

export default router;
