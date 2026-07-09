import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authRateLimiter } from '../middleware/rateLimit';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/schemas';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));
router.get('/me', authMiddleware, asyncHandler(authController.me));
router.patch(
  '/me',
  authMiddleware,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);

export default router;
