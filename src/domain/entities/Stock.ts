/**
 * Domain Entity: Stock
 * Pure business object without framework dependencies
 */

export enum Exchange {
  NSE = 'NSE',
  BSE = 'BSE',
}

export interface Stock {
  readonly symbol: string;
  readonly name: string;
  readonly exchange: Exchange;
  readonly instrumentToken: number;
  readonly lastPrice?: number;
  readonly points?: number;
  readonly capCategory?: string;
}
