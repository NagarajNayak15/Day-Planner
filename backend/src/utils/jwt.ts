import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign({ sub: userId, type: 'refresh', jti }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwt.accessSecret) as jwt.JwtPayload;
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return { sub: String(payload.sub), type: 'access' };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwt.refreshSecret) as jwt.JwtPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return { sub: String(payload.sub), type: 'refresh', jti: String(payload.jti) };
}
