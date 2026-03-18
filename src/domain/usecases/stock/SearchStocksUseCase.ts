/**
 * Use Case: Search Stocks
 * Single Responsibility: Search for stocks by query
 */

import { Stock } from '../../entities/Stock';
import { StockRepository } from '../../repositories/StockRepository';

export class SearchStocksUseCase {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: string): Promise<Stock[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    return await this.stockRepository.searchStocks(query.trim());
  }
}
