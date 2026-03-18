/**
 * Domain Entity: Game
 * Pure business object without framework dependencies
 */

export enum GameStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface StockPerformer {
  symbol: string;
  percentageChange: number;
}

export interface GameStock {
  readonly symbol: string;
  readonly openingPrice: number;
  readonly closingPrice?: number;
  readonly currentPrice?: number;
  readonly percentageChange?: number;
}

export interface Game {
  readonly id: string;
  readonly userId: string;
  readonly status: GameStatus;
  readonly createdAt: Date;
  readonly closedAt?: Date;
  readonly stocks: readonly GameStock[];
  readonly openingPrice?: number;
  readonly closingPrice?: number;
  readonly totalReturnPercentage?: number;
  readonly bestPerformer?: StockPerformer;
  readonly worstPerformer?: StockPerformer;
  readonly momentum?: string;
}
