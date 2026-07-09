import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { asyncHandler } from '../utils/asyncHandler';
import { taskService } from '../services/taskService';
import {
  taskSchema,
  taskUpdateSchema,
  taskQuerySchema,
} from '../validations/schemas';

export const taskController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = taskQuerySchema.parse(req.query);
    const tasks = await taskService.list(req.userId!, query);
    res.json({ tasks });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = taskSchema.parse(req.body);
    const task = await taskService.create(req.userId!, input);
    res.status(201).json({ task });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = taskUpdateSchema.parse(req.body);
    const task = await taskService.update(req.userId!, req.params.id, input);
    res.json({ task });
  }),

  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await taskService.remove(req.userId!, req.params.id);
    res.json(result);
  }),

  complete: asyncHandler(async (req: AuthRequest, res: Response) => {
    const completed = req.body?.completed !== false;
    const task = await taskService.complete(req.userId!, req.params.id, completed);
    res.json({ task });
  }),
};
