/**
 * Use Case: Get Active Games
 * Single Responsibility: Fetch user's active games
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export class GetActiveGamesUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(): Promise<Game[]> {
    return await this.gameRepository.getActiveGames();
  }
}
