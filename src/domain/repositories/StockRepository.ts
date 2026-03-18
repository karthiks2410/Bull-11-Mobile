/**
 * Domain Repository Interface: Stock
 * Defines contract for stock operations (Dependency Inversion Principle)
 */

import { Stock } from '../entities/Stock';

export interface StockRepository {
  searchStocks(query: string): Promise<Stock[]>;
}
