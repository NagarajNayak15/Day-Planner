import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { asyncHandler } from '../utils/asyncHandler';
import { habitService } from '../services/habitService';
import { todayKey } from '../utils/date';
import {
  habitSchema,
  habitUpdateSchema,
  habitCompleteSchema,
  habitHistoryQuerySchema,
} from '../validations/schemas';

export const habitController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const habits = await habitService.list(req.userId!);
    res.json({ habits });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = habitSchema.parse(req.body);
    const habit = await habitService.create(req.userId!, input);
    res.status(201).json({ habit });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = habitUpdateSchema.parse(req.body);
    const habit = await habitService.update(req.userId!, req.params.id, input);
    res.json({ habit });
  }),

  toggle: asyncHandler(async (req: AuthRequest, res: Response) => {
    const habit = await habitService.toggle(req.userId!, req.params.id);
    res.json({ habit });
  }),

  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await habitService.remove(req.userId!, req.params.id);
    res.json(result);
  }),

  complete: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = habitCompleteSchema.parse(req.body);
    const completion = await habitService.complete(req.userId!, req.params.id, input);
    res.json({ completion });
  }),

  history: asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = habitHistoryQuerySchema.parse(req.query);
    const history = await habitService.history(req.userId!, query);
    res.json(history);
  }),

  completions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : todayKey();
    const result = await habitService.getCompletions(req.userId!, date);
    res.json(result);
  }),
};
