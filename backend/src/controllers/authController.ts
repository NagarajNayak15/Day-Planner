import { Response } from 'express';
import { AuthRequest } from '../middleware/types';
import { authService } from '../services/authService';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/schemas';
import { env } from '../config/env';

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: env.jwt.refreshExpiresMs,
  });
}

function clearRefreshCookie(res: Response) {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    setRefreshCookie(res, result.tokens.refreshToken);
    res.status(201).json({ user: result.user, accessToken: result.tokens.accessToken });
  },

  async login(req: AuthRequest, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    setRefreshCookie(res, result.tokens.refreshToken);
    res.json({ user: result.user, accessToken: result.tokens.accessToken });
  },

  async refresh(req: AuthRequest, res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;
    const tokens = await authService.refresh(token);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken });
  },

  async logout(req: AuthRequest, res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;
    await authService.logout(token);
    clearRefreshCookie(res);
    res.json({ success: true });
  },

  async me(req: AuthRequest, res: Response) {
    const user = await authService.getProfile(req.userId!);
    res.json({ user });
  },

  async updateProfile(req: AuthRequest, res: Response) {
    const input = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.userId!, input);
    res.json({ user });
  },
};
