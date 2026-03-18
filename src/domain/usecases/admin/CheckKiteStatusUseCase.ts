/**
 * Use Case: Check Kite Status
 * Single Responsibility: Check if Kite session is active
 */

import { AdminRepository } from '../../repositories/AdminRepository';

export interface KiteStatusResponse {
  sessionValid: boolean;
  tickerConnected: boolean;
  userId?: string;
  expiresAt?: string;
}

export class CheckKiteStatusUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(): Promise<KiteStatusResponse> {
    return await this.adminRepository.checkKiteStatus();
  }
}
