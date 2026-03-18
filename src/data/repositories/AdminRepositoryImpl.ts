/**
 * Admin Repository Implementation
 * Implements admin-only operations (Kite OAuth, User Management)
 */

import { AdminRepository } from '@/src/domain/repositories/AdminRepository';
import { User } from '@/src/domain/entities/User';
import { ApiClient } from '../api/ApiClient';
import { UserMapper } from '../mappers/UserMapper';
import { API_ENDPOINTS } from '@/src/core/constants/app.constants';
import { UserDTO, UserProfileResponseDTO } from '../api/dto';
import { KiteStatusResponse } from '@/src/domain/usecases/admin/CheckKiteStatusUseCase';

export class AdminRepositoryImpl implements AdminRepository {
  constructor(private readonly apiClient: ApiClient) {}

  // Kite Authentication
  async getKiteLoginUrl(): Promise<string> {
    const response = await this.apiClient.get<{ loginUrl: string }>(
      API_ENDPOINTS.ADMIN.KITE_LOGIN_URL
    );
    return response.loginUrl;
  }

  async handleKiteCallback(requestToken: string): Promise<string> {
    const response = await this.apiClient.get<{ message: string }>(
      API_ENDPOINTS.ADMIN.KITE_CALLBACK,
      { request_token: requestToken }
    );
    return response.message;
  }

  async checkKiteStatus(): Promise<KiteStatusResponse> {
    const response = await this.apiClient.get<KiteStatusResponse>(
      API_ENDPOINTS.ADMIN.KITE_STATUS
    );
    return response;
  }

  // User Management
  async getAllUsers(): Promise<User[]> {
    const usersDTO = await this.apiClient.get<UserProfileResponseDTO[]>(
      API_ENDPOINTS.ADMIN.USERS
    );
    return usersDTO.map(UserMapper.fromUserProfileResponse);
  }

  async getUserById(userId: string): Promise<User> {
    const userDTO = await this.apiClient.get<UserProfileResponseDTO>(
      API_ENDPOINTS.ADMIN.USER_BY_ID(userId)
    );
    return UserMapper.fromUserProfileResponse(userDTO);
  }

  async getUserByEmail(email: string): Promise<User> {
    const userDTO = await this.apiClient.get<UserProfileResponseDTO>(
      API_ENDPOINTS.ADMIN.USER_BY_EMAIL(email)
    );
    return UserMapper.fromUserProfileResponse(userDTO);
  }
}
