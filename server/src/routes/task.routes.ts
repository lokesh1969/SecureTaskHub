import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTasks, createTask, updateTaskStatus } from '../controllers/task.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id/status', updateTaskStatus);

export default router;
