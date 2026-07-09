import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskSchema, taskUpdateSchema, taskQuerySchema } from '../validations/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(taskQuerySchema, 'query'), taskController.list);
router.post('/', validate(taskSchema), taskController.create);
router.put('/:id', validate(taskUpdateSchema), taskController.update);
router.delete('/:id', taskController.remove);
router.patch('/:id/complete', taskController.complete);

export default router;
