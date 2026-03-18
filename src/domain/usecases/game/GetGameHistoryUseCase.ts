/**
 * Use Case: Get Game History
 * Single Responsibility: Fetch user's game history
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export class GetGameHistoryUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(): Promise<Game[]> {
    return await this.gameRepository.getGameHistory();
  }
}
