import { Router } from 'express';
import { statsController } from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', statsController.get);

export default router;
