/**
 * Use Case: Handle Kite OAuth Callback (Admin Only)
 * Single Responsibility: Complete Kite authentication with request token
 */

import { AdminRepository } from '../../repositories/AdminRepository';

export class HandleKiteCallbackUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(requestToken: string): Promise<string> {
    if (!requestToken || requestToken.trim().length === 0) {
      throw new Error('Request token is required');
    }

    return await this.adminRepository.handleKiteCallback(requestToken);
  }
}
