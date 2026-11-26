import { User } from '../models/User.js';

/** Data-access layer for users. Services never touch Mongoose models directly. */
export class UserRepository {
  findById(id) {
    return User.findById(id);
  }

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  /** Same as findByEmail but includes the password hash (login only). */
  findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  }

  create(data) {
    return User.create(data);
  }
}
