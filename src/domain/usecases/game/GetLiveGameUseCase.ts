/**
 * Use Case: Get Live Game
 * Single Responsibility: Fetch live game details with current prices
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export class GetLiveGameUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: string): Promise<Game> {
    return await this.gameRepository.getLiveGame(gameId);
  }
}
