/**
 * User Mapper
 * Converts between DTO and Domain Entity
 */

import { User, UserRole } from '@/src/domain/entities/User';
import { AuthResponseDTO, UserDTO, UserProfileResponseDTO, RegisterResponseDTO } from '../api/dto';

export class UserMapper {
  /**
   * Convert AuthResponseDTO (flattened structure) to User domain entity
   */
  static fromAuthResponse(dto: AuthResponseDTO): User {
    return {
      id: dto.userId,
      email: dto.email,
      name: dto.name,
      role: dto.role as UserRole,
      createdAt: new Date(), // AuthResponse doesn't include createdAt
    };
  }

  /**
   * Convert UserDTO to User domain entity
   */
  static fromUserDTO(dto: UserDTO): User {
    return {
      id: dto.userId,
      email: dto.email,
      name: dto.name,
      role: dto.role as UserRole,
      createdAt: new Date(dto.createdAt),
    };
  }

  /**
   * Convert UserProfileResponseDTO to User domain entity
   */
  static fromUserProfileResponse(dto: UserProfileResponseDTO): User {
    return {
      id: dto.userId,
      email: dto.email,
      name: dto.name,
      role: dto.role as UserRole,
      createdAt: new Date(dto.createdAt),
      totalGames: dto.totalGames,
    };
  }

  /**
   * Convert RegisterResponseDTO to User domain entity
   */
  static fromRegisterResponse(dto: RegisterResponseDTO): User {
    return {
      id: dto.userId,
      email: dto.email,
      name: dto.name,
      role: dto.role as UserRole,
      createdAt: new Date(), // RegisterResponse doesn't include createdAt
    };
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use specific mapper methods instead
   */
  static toDomain(dto: UserDTO): User {
    return this.fromUserDTO(dto);
  }

  /**
   * Convert User domain entity to UserDTO
   */
  static toDTO(domain: User): UserDTO {
    return {
      userId: domain.id,
      email: domain.email,
      name: domain.name,
      role: domain.role,
      createdAt: domain.createdAt.toISOString(),
    };
  }
}
