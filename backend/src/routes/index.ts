import { Router } from 'express';
import auth from './auth';
import habits from './habits';
import tasks from './tasks';
import stats from './stats';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
router.use('/auth', auth);
router.use('/habits', habits);
router.use('/tasks', tasks);
router.use('/stats', stats);

export default router;
