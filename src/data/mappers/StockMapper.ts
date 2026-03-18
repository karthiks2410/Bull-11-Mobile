/**
 * Stock Mapper
 * Converts between DTO and Domain Entity
 */

import { Stock, Exchange } from '@/src/domain/entities/Stock';
import { StockDTO } from '../api/dto';

export class StockMapper {
  static toDomain(dto: StockDTO): Stock {
    return {
      symbol: dto.symbol,
      name: dto.name,
      exchange: dto.exchange as Exchange,
      instrumentToken: dto.instrumentToken,
      lastPrice: dto.lastPrice,
    };
  }
}
