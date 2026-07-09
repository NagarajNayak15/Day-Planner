import { Router } from 'express';
import { habitController } from '../controllers/habitController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { habitSchema, habitUpdateSchema, habitCompleteSchema, habitHistoryQuerySchema } from '../validations/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/', habitController.list);
router.get('/history', validate(habitHistoryQuerySchema, 'query'), habitController.history);
router.get('/completions', habitController.completions);
router.post('/', validate(habitSchema), habitController.create);
router.put('/:id', validate(habitUpdateSchema), habitController.update);
router.patch('/:id/toggle', habitController.toggle);
router.delete('/:id', habitController.remove);
router.post('/:id/complete', validate(habitCompleteSchema), habitController.complete);

export default router;
