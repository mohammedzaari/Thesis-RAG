import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { USER_ROLES } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';

const BCRYPT_COST = 12;

/** Authentication use cases: registration, login, token rotation. */
export class AuthService {
  /** @param {import('../repository/UserRepository.js').UserRepository} userRepository */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register({ email, fullName, password }) {
    if (env.allowedEmailDomain && !email.toLowerCase().endsWith(`@${env.allowedEmailDomain}`)) {
      throw new HttpError(403, `Registration is restricted to @${env.allowedEmailDomain} addresses`);
    }
    if (await this.userRepository.findByEmail(email)) {
      throw new HttpError(409, 'Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await this.userRepository.create({ email, fullName, passwordHash, role: USER_ROLES.STUDENT });
    return this.toPublicUser(user);
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmailWithPassword(email);
    // Same message for unknown email and wrong password: no account enumeration.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid credentials');
    }
    return {
      user: this.toPublicUser(user),
      accessToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
    };
  }

  /** Issues a new access token from a valid refresh token. */
  async refresh(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
      const user = await this.userRepository.findById(payload.sub);
      if (!user) throw new Error('User not found');
      return { user: this.toPublicUser(user), accessToken: this.signAccessToken(user) };
    } catch {
      throw new HttpError(401, 'Session expired');
    }
  }

  signAccessToken(user) {
    return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.accessTokenTtl });
  }

  signRefreshToken(user) {
    return jwt.sign({ sub: user.id }, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });
  }

  toPublicUser(user) {
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }
}
