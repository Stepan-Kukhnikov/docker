import { User } from '../users/entities/user.entity';

export function excludePassword<T extends Partial<User>>(user: T): Omit<T, 'password'> {
  if (user && 'password' in user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<T, 'password'>;
  }
  return user as Omit<T, 'password'>;
}

export function excludePasswordFromArray<T extends Partial<User>>(users: T[]): Omit<T, 'password'>[] {
  return users.map(user => excludePassword(user));
}