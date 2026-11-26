import fs from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { USER_ROLES } from '../models/User.js';

const SEED_FILE = new URL('../../resources/seed/library.xml', import.meta.url);

/** Idempotent bootstrap data: first administrator and starter guides (via XML import). */
export class SeedService {
  constructor(userRepository, documentRepository, documentService) {
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.documentService = documentService;
  }

  async run() {
    await this.ensureAdmin();
    await this.ensureStarterLibrary();
  }

  async ensureAdmin() {
    if (!env.adminEmail || !env.adminPassword) return;
    if (await this.userRepository.findByEmail(env.adminEmail)) return;
    await this.userRepository.create({
      email: env.adminEmail,
      fullName: 'Programme Administrator',
      passwordHash: await bcrypt.hash(env.adminPassword, 12),
      role: USER_ROLES.ADMIN,
    });
    console.info(`[seed] Administrator created: ${env.adminEmail}`);
  }

  async ensureStarterLibrary() {
    if ((await this.documentRepository.count()) > 0) return;
    const { imported } = await this.documentService.importXml(await fs.readFile(SEED_FILE, 'utf8'), undefined);
    console.info(`[seed] Starter library imported (${imported} documents)`);
  }
}
