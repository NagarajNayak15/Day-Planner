import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { asyncHandler } from '../utils/asyncHandler';
import { statsService } from '../services/statsService';

export const statsController = {
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await statsService.getStats(req.userId!);
    if (!stats) {
      res.status(404).json({ error: { message: 'User not found' } });
      return;
    }
    res.json({ stats });
  }),
};
