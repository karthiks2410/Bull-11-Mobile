/**
 * Use Case: Start Game
 * Single Responsibility: Create new game with stock selection
 */

import { Game } from '../../entities/Game';
import { GameRepository } from '../../repositories/GameRepository';

export interface StartGameRequest {
  stockSymbols: string[];
  exchange?: string; // Optional: if all stocks are from same exchange
}

export class StartGameUseCase {
  private isGameStarting = false;

  constructor(private readonly gameRepository: GameRepository) {}

  async execute(request: StartGameRequest): Promise<Game> {
    const { stockSymbols, exchange } = request;

    // Prevent duplicate requests
    if (this.isGameStarting) {
      throw new Error('A game is already being started. Please wait.');
    }

    try {
      this.isGameStarting = true;

      // Business validation
      this.validateStockSymbols(stockSymbols);

      return await this.gameRepository.startGame(stockSymbols, exchange);
    } finally {
      this.isGameStarting = false;
    }
  }

  private validateStockSymbols(symbols: string[]): void {
    // Null/undefined check
    if (!symbols || !Array.isArray(symbols)) {
      throw new Error('Stock symbols must be provided');
    }

    // Quantity validation
    if (symbols.length < 3 || symbols.length > 5) {
      throw new Error('Select 3 to 5 stocks');
    }

    // Check for empty or invalid symbols
    const invalidSymbols = symbols.filter(
      s => !s || typeof s !== 'string' || s.trim().length === 0
    );
    if (invalidSymbols.length > 0) {
      throw new Error('All stocks must have valid symbols');
    }

    // Check for duplicates (case-insensitive)
    const normalizedSymbols = symbols.map(s => s.trim().toUpperCase());
    const uniqueSymbols = new Set(normalizedSymbols);
    if (uniqueSymbols.size !== symbols.length) {
      throw new Error('Duplicate stocks selected');
    }
  }
}
