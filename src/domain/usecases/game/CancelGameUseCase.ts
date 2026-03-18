/**
 * Use Case: Cancel Game
 * Single Responsibility: Cancel active game
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export class CancelGameUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: string): Promise<Game> {
    if (!gameId) {
      throw new Error('Game ID is required');
    }

    return await this.gameRepository.cancelGame(gameId);
  }
}
