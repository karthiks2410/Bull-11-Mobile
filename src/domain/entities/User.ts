/**
 * Domain Entity: User
 * Pure business object without framework dependencies
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly totalGames?: number;
}
