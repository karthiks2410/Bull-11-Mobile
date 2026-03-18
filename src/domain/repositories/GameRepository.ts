/**
 * Domain Repository Interface: Game
 * Defines contract for game operations (Dependency Inversion Principle)
 */

import { Game } from '../entities/Game';

export interface GameRepository {
  startGame(stockSymbols: string[], exchange?: string): Promise<Game>;
  getGameById(gameId: string): Promise<Game>;
  getLiveGame(gameId: string): Promise<Game>;
  closeGame(gameId: string): Promise<Game>;
  cancelGame(gameId: string): Promise<Game>;
  getGameHistory(): Promise<Game[]>;
  getActiveGames(): Promise<Game[]>;
}
