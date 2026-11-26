import { env } from '../config/env.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // not readable from JavaScript (XSS mitigation)
  secure: env.isProduction,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/** HTTP adapter for authentication use cases. */
export class AuthController {
  /** @param {import('../services/AuthService.js').AuthService} authService */
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
    const user = await this.authService.register(req.validated.body);
    res.status(201).json(user);
  };

  login = async (req, res) => {
    const { user, accessToken, refreshToken } = await this.authService.login(req.validated.body);
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ user, accessToken });
  };

  refresh = async (req, res) => {
    res.json(await this.authService.refresh(req.cookies?.[REFRESH_COOKIE]));
  };

  logout = (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_OPTIONS.path });
    res.sendStatus(204);
  };
}
