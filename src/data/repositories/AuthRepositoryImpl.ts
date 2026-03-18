/**
 * Auth Repository Implementation
 * Implements domain repository interface
 */

import { AuthRepository } from '@/src/domain/repositories/AuthRepository';
import { User } from '@/src/domain/entities/User';
import { ApiClient } from '../api/ApiClient';
import { StorageService } from '../storage/StorageService';
import { UserMapper } from '../mappers/UserMapper';
import { API_ENDPOINTS } from '@/src/core/constants/app.constants';
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  RegisterResponseDTO,
  AuthResponseDTO,
  UserDTO,
} from '../api/dto';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly storageService: StorageService
  ) {}

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const request: LoginRequestDTO = { email, password };
    const response = await this.apiClient.post<AuthResponseDTO>(
      API_ENDPOINTS.AUTH.LOGIN,
      request
    );

    return {
      token: response.token,
      user: UserMapper.fromAuthResponse(response),
    };
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    // Only register user (returns user info, no token)
    const registerRequest: RegisterRequestDTO = { email, password, name };
    const registerResponse = await this.apiClient.post<RegisterResponseDTO>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerRequest
    );

    // Return user without token - they need to login separately
    return UserMapper.fromRegisterResponse(registerResponse);
  }

  async getCurrentUser(): Promise<User> {
    const userDTO = await this.apiClient.get<UserDTO>(API_ENDPOINTS.AUTH.ME);
    return UserMapper.fromUserDTO(userDTO);
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  async storeToken(token: string): Promise<void> {
    await this.storageService.storeToken(token);
  }

  async getToken(): Promise<string | null> {
    return await this.storageService.getToken();
  }

  async clearToken(): Promise<void> {
    await this.storageService.clearToken();
  }
}
