import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validations/schemas';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;
    createdAt: Date;
  };
  tokens: AuthTokens;
}

function sanitize(user: InstanceType<typeof User>): AuthResult['user'] {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastStreakDate: user.lastStreakDate,
    createdAt: user.createdAt,
  };
}

async function issueTokens(userId: string): Promise<AuthTokens> {
  const accessToken = signAccessToken(userId);
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken(userId, jti);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresMs);
  await User.findByIdAndUpdate(userId, {
    $push: { refreshTokens: { jti, expiresAt } },
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }
    const hashed = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hashed,
    });
    const tokens = await issueTokens(user._id.toString());
    return { user: sanitize(user), tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const ok = await user.comparePassword(input.password);
    if (!ok) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const tokens = await issueTokens(user._id.toString());
    return { user: sanitize(user), tokens };
  },

  async refresh(refreshToken: string | undefined): Promise<AuthTokens> {
    if (!refreshToken) {
      throw ApiError.unauthorized('Missing refresh token');
    }
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    const stored = user.refreshTokens.find((t) => t.jti === payload.jti);
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw ApiError.unauthorized('Refresh token revoked or expired');
    }
    // Rotate: remove old token, issue new pair.
    user.refreshTokens = user.refreshTokens.filter((t) => t.jti !== payload.jti);
    const tokens = await issueTokensWithUser(user, payload.sub);
    return tokens;
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await User.findByIdAndUpdate(payload.sub, {
        $pull: { refreshTokens: { jti: payload.jti } },
      });
    } catch {
      // ignore invalid tokens on logout
    }
  },

  async getProfile(userId: string): Promise<AuthResult['user']> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return sanitize(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthResult['user']> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    user.name = input.name;
    await user.save();
    return sanitize(user);
  },
};

async function issueTokensWithUser(
  user: InstanceType<typeof User>,
  userId: string
): Promise<AuthTokens> {
  const accessToken = signAccessToken(userId);
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken(userId, jti);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresMs);
  user.refreshTokens.push({ jti, expiresAt });
  await user.save();
  return { accessToken, refreshToken };
}
