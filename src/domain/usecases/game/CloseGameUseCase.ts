/**
 * Use Case: Close Game
 * Single Responsibility: Finalize game with closing prices
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export class CloseGameUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: string): Promise<Game> {
    if (!gameId) {
      throw new Error('Game ID is required');
    }

    return await this.gameRepository.closeGame(gameId);
  }
}
