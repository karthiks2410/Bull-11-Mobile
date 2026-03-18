/**
 * Game Mapper
 * Converts between DTO and Domain Entity
 */

import { Game, GameStatus, GameStock, StockPerformer } from '@/src/domain/entities/Game';
import { GameDTO, GameStockDTO, GameSummaryDTO, StockPerformerDTO, GameLiveResponseDTO } from '../api/dto';

export class GameMapper {
  static toDomain(dto: GameDTO): Game {
    return {
      id: dto.id,
      userId: dto.userId,
      status: dto.status as GameStatus,
      createdAt: new Date(dto.createdAt),
      closedAt: dto.closedAt ? new Date(dto.closedAt) : undefined,
      stocks: dto.stocks.map(this.stockToDomain),
      openingPrice: dto.openingPrice,
      closingPrice: dto.closingPrice,
      totalReturnPercentage: dto.totalReturnPercentage,
      bestPerformer: dto.bestPerformer ? this.performerToDomain(dto.bestPerformer) : undefined,
      worstPerformer: dto.worstPerformer ? this.performerToDomain(dto.worstPerformer) : undefined,
      momentum: dto.momentum,
    };
  }

  static liveResponseToDomain(dto: GameLiveResponseDTO): Game {
    // Calculate opening/closing prices from stocks
    const openingPrice = dto.stocks.reduce((sum, stock) => sum + stock.openingPrice, 0);
    const closingPrice = dto.status === 'COMPLETED' || dto.status === 'CANCELLED'
      ? dto.stocks.reduce((sum, stock) => sum + (stock.closingPrice || stock.currentPrice || stock.openingPrice), 0)
      : undefined;

    return {
      id: dto.gameId,
      userId: '', // Not provided in live response
      status: dto.status as GameStatus,
      createdAt: new Date(dto.startTime),
      closedAt: dto.endTime ? new Date(dto.endTime) : undefined,
      stocks: dto.stocks.map(this.stockToDomain),
      openingPrice,
      closingPrice,
      totalReturnPercentage: dto.totalReturn,
      bestPerformer: dto.bestPerformer ? this.performerToDomain(dto.bestPerformer) : undefined,
      worstPerformer: dto.worstPerformer ? this.performerToDomain(dto.worstPerformer) : undefined,
      momentum: dto.momentum,
    };
  }

  static summaryToDomain(dto: GameSummaryDTO): Game {
    // Convert GameSummaryDTO to Game entity
    // For completed games, backend now includes full stock details
    const stocks: GameStock[] = dto.stocks?.map(this.stockToDomain) ?? dto.stockSymbols.map(symbol => ({
      symbol,
      openingPrice: 0, // Fallback: Summary doesn't include individual stock prices
      closingPrice: undefined,
      currentPrice: undefined,
      percentageChange: undefined,
    }));

    // Calculate portfolio opening/closing prices from stocks if available
    let openingPrice: number | undefined = undefined;
    let closingPrice: number | undefined = undefined;

    if (dto.stocks && dto.stocks.length > 0) {
      openingPrice = dto.stocks.reduce((sum, stock) => sum + stock.openingPrice, 0);
      // For completed games, use closingPrice; for active games, use currentPrice
      if (dto.status === 'COMPLETED' || dto.status === 'CANCELLED') {
        closingPrice = dto.stocks.reduce((sum, stock) => sum + (stock.closingPrice || stock.openingPrice), 0);
      }
    }

    return {
      id: dto.gameId,
      userId: '', // GameSummaryDTO doesn't include userId, will be set by repository
      status: dto.status as GameStatus,
      createdAt: new Date(dto.startTime),
      closedAt: dto.endTime ? new Date(dto.endTime) : undefined,
      stocks,
      openingPrice,
      closingPrice,
      totalReturnPercentage: dto.totalReturn,
      bestPerformer: dto.bestPerformer ? this.performerToDomain(dto.bestPerformer) : undefined,
      worstPerformer: dto.worstPerformer ? this.performerToDomain(dto.worstPerformer) : undefined,
    };
  }

  private static stockToDomain(dto: GameStockDTO): GameStock {
    return {
      symbol: dto.symbol,
      openingPrice: dto.openingPrice,
      closingPrice: dto.closingPrice,
      currentPrice: dto.currentPrice,
      percentageChange: dto.percentageChange,
    };
  }

  private static performerToDomain(dto: StockPerformerDTO): StockPerformer {
    return {
      symbol: dto.symbol,
      percentageChange: dto.percentageChange,
    };
  }
}
