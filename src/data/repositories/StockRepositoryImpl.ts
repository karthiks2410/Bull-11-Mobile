/**
 * Stock Repository Implementation
 * Implements domain repository interface
 */

import { StockRepository } from '@/src/domain/repositories/StockRepository';
import { Stock } from '@/src/domain/entities/Stock';
import { ApiClient } from '../api/ApiClient';
import { StockMapper } from '../mappers/StockMapper';
import { API_ENDPOINTS } from '@/src/core/constants/app.constants';
import { StockDTO } from '../api/dto';

export class StockRepositoryImpl implements StockRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async searchStocks(query: string): Promise<Stock[]> {
    const stocksDTO = await this.apiClient.get<StockDTO[]>(
      API_ENDPOINTS.STOCKS.SEARCH,
      { q: query }
    );
    return stocksDTO.map(StockMapper.toDomain);
  }
}
