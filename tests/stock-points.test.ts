/**
 * Stock Points / Captain / Budget System Tests - QUnit
 * Tests for budget validation, captain selection logic, use cases, and DTO mappers
 */

import QUnit from 'qunit';
import { SubmitTeamUseCase } from '../src/domain/usecases/contest/SubmitTeamUseCase';
import { UpdateTeamUseCase } from '../src/domain/usecases/contest/UpdateTeamUseCase';
import { StockMapper } from '../src/data/mappers/StockMapper';

// ===========================
// Helpers (mirrors team-builder logic)
// ===========================

const DEFAULT_POINTS = 9;
const BUDGET = 50;

function calcUsedPoints(stocks: Array<{ points?: number }>): number {
  return stocks.reduce((sum, s) => sum + (s.points ?? DEFAULT_POINTS), 0);
}

function canAddStock(
  currentStocks: Array<{ points?: number }>,
  newStock: { points?: number }
): boolean {
  return calcUsedPoints(currentStocks) + (newStock.points ?? DEFAULT_POINTS) <= BUDGET;
}

function toggleCaptain(current: string | null, symbol: string, stockCount: number): string | null {
  if (stockCount < 5) return current; // only allowed with full team
  return current?.toUpperCase() === symbol.toUpperCase() ? null : symbol;
}

function removeCaptainIfMatch(captainSymbol: string | null, removedSymbol: string): string | null {
  return captainSymbol?.toUpperCase() === removedSymbol.toUpperCase() ? null : captainSymbol;
}

// ===========================
// Mock Repository
// ===========================

function makeMockRepo() {
  const calls: Array<{ method: string; args: any[] }> = [];
  return {
    calls,
    submitTeam: async (contestId: string, stockSymbols: string[], captainSymbol?: string) => {
      calls.push({ method: 'submitTeam', args: [contestId, stockSymbols, captainSymbol] });
    },
    updateTeam: async (contestId: string, stockSymbols: string[], captainSymbol?: string) => {
      calls.push({ method: 'updateTeam', args: [contestId, stockSymbols, captainSymbol] });
    },
    // Unused stubs
    listContests: async () => [],
    getContestById: async () => { throw new Error('not implemented'); },
    getUpcomingContests: async () => [],
    getLiveContests: async () => [],
    getCompletedContests: async () => [],
    joinContest: async () => {},
    getMyTeam: async () => { throw new Error('not implemented'); },
    withdrawFromContest: async () => {},
    getLeaderboard: async () => [],
    getMyPerformance: async () => { throw new Error('not implemented'); },
    getMyContests: async () => [],
  };
}

const FIVE_SYMBOLS = ['TCS', 'INFY', 'SBIN', 'ZOMATO', 'SUZLON'];

// ===========================
// Module 1: Budget Validation Logic
// ===========================

QUnit.module('Budget Validation Logic', () => {
  QUnit.test('usedPoints sums stock points correctly', (assert) => {
    const stocks = [{ points: 10 }, { points: 9 }, { points: 9 }];
    assert.equal(calcUsedPoints(stocks), 28);
  });

  QUnit.test('stock with undefined points defaults to 9', (assert) => {
    const stocks = [{ points: undefined }, { points: 10 }];
    assert.equal(calcUsedPoints(stocks), 19);
  });

  QUnit.test('stock selection allowed when within budget (28+9=37)', (assert) => {
    const current = [{ points: 10 }, { points: 9 }, { points: 9 }]; // 28 pts
    assert.ok(canAddStock(current, { points: 9 }), 'Should allow 28+9=37 ≤ 50');
  });

  QUnit.test('stock selection blocked when exceeds budget (46+10=56)', (assert) => {
    const current = [{ points: 10 }, { points: 9 }, { points: 9 }, { points: 18 }]; // 46 pts
    assert.notOk(canAddStock(current, { points: 10 }), 'Should block 46+10=56 > 50');
  });

  QUnit.test('stock selection allowed when exactly at budget (41+9=50)', (assert) => {
    const current = [{ points: 10 }, { points: 10 }, { points: 12 }, { points: 9 }]; // 41 pts
    assert.ok(canAddStock(current, { points: 9 }), 'Should allow 41+9=50 ≤ 50');
  });

  QUnit.test('empty team has 0 used points', (assert) => {
    assert.equal(calcUsedPoints([]), 0);
  });
});

// ===========================
// Module 2: Captain Selection Logic
// ===========================

QUnit.module('Captain Selection Logic', () => {
  QUnit.test('captain cannot be set with fewer than 5 stocks', (assert) => {
    const result = toggleCaptain(null, 'TCS', 4);
    assert.strictEqual(result, null, 'Should not set captain with only 4 stocks');
  });

  QUnit.test('captain is set when 5 stocks selected', (assert) => {
    const result = toggleCaptain(null, 'TCS', 5);
    assert.equal(result, 'TCS');
  });

  QUnit.test('captain toggles off when same symbol tapped again', (assert) => {
    const result = toggleCaptain('TCS', 'TCS', 5);
    assert.strictEqual(result, null, 'Tapping captain again should clear it');
  });

  QUnit.test('captain toggles off case-insensitively', (assert) => {
    const result = toggleCaptain('TCS', 'tcs', 5);
    assert.strictEqual(result, null);
  });

  QUnit.test('captain switches to new stock', (assert) => {
    const result = toggleCaptain('TCS', 'INFY', 5);
    assert.equal(result, 'INFY');
  });

  QUnit.test('captain cleared when captain stock is removed', (assert) => {
    const result = removeCaptainIfMatch('TCS', 'TCS');
    assert.strictEqual(result, null);
  });

  QUnit.test('captain stays when a different stock is removed', (assert) => {
    const result = removeCaptainIfMatch('TCS', 'INFY');
    assert.equal(result, 'TCS');
  });

  QUnit.test('null captain stays null when any stock removed', (assert) => {
    const result = removeCaptainIfMatch(null, 'TCS');
    assert.strictEqual(result, null);
  });
});

// ===========================
// Module 3: SubmitTeamUseCase with captain
// ===========================

QUnit.module('SubmitTeamUseCase', () => {
  QUnit.test('execute passes captain symbol to repository', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new SubmitTeamUseCase(repo as any);

    await useCase.execute({ contestId: 'contest-1', stockSymbols: FIVE_SYMBOLS, captain: 'TCS' });

    assert.equal(repo.calls.length, 1);
    const call = repo.calls[0];
    assert.equal(call.method, 'submitTeam');
    assert.equal(call.args[0], 'contest-1');
    assert.deepEqual(call.args[1], FIVE_SYMBOLS);
    assert.equal(call.args[2], 'TCS', 'Captain should be passed to repository');
  });

  QUnit.test('execute with no captain passes undefined', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new SubmitTeamUseCase(repo as any);

    await useCase.execute({ contestId: 'contest-1', stockSymbols: FIVE_SYMBOLS });

    assert.equal(repo.calls[0].args[2], undefined, 'Captain should be undefined when not set');
  });

  QUnit.test('execute throws when fewer than 5 stocks provided', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new SubmitTeamUseCase(repo as any);

    try {
      await useCase.execute({ contestId: 'contest-1', stockSymbols: ['TCS', 'INFY'] });
      assert.ok(false, 'Should have thrown');
    } catch (e: any) {
      assert.ok(e.message.includes('5'), 'Error should mention 5 stocks');
    }
  });

  QUnit.test('execute throws when more than 5 stocks provided', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new SubmitTeamUseCase(repo as any);

    try {
      await useCase.execute({ contestId: 'contest-1', stockSymbols: [...FIVE_SYMBOLS, 'HDFC'] });
      assert.ok(false, 'Should have thrown');
    } catch (e: any) {
      assert.ok(e.message.includes('5'));
    }
  });
});

// ===========================
// Module 4: UpdateTeamUseCase with captain
// ===========================

QUnit.module('UpdateTeamUseCase', () => {
  QUnit.test('execute passes captain to repository', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new UpdateTeamUseCase(repo as any);

    await useCase.execute({ contestId: 'contest-2', stockSymbols: FIVE_SYMBOLS, captain: 'SBIN' });

    const call = repo.calls[0];
    assert.equal(call.method, 'updateTeam');
    assert.equal(call.args[2], 'SBIN');
  });

  QUnit.test('execute with no captain passes undefined', async (assert) => {
    const repo = makeMockRepo();
    const useCase = new UpdateTeamUseCase(repo as any);

    await useCase.execute({ contestId: 'contest-2', stockSymbols: FIVE_SYMBOLS });

    assert.strictEqual(repo.calls[0].args[2], undefined);
  });
});

// ===========================
// Module 5: StockMapper — new fields
// ===========================

QUnit.module('StockMapper — points and capCategory', () => {
  QUnit.test('maps points and capCategory from DTO', (assert) => {
    const dto = {
      symbol: 'TCS',
      name: 'TATA CONSULTANCY SERV LTD',
      exchange: 'NSE' as const,
      instrumentToken: 2953217,
      lastPrice: 3500,
      points: 10,
      capCategory: 'LARGE' as const,
    };

    const stock = StockMapper.toDomain(dto);
    assert.equal(stock.points, 10);
    assert.equal(stock.capCategory, 'LARGE');
  });

  QUnit.test('points and capCategory are undefined when absent from DTO', (assert) => {
    const dto = {
      symbol: 'SUZLON',
      name: 'SUZLON ENERGY LTD',
      exchange: 'NSE' as const,
      instrumentToken: 12345,
    };

    const stock = StockMapper.toDomain(dto);
    assert.strictEqual(stock.points, undefined);
    assert.strictEqual(stock.capCategory, undefined);
  });

  QUnit.test('all core fields still mapped correctly', (assert) => {
    const dto = {
      symbol: 'INFY',
      name: 'INFOSYS LTD',
      exchange: 'BSE' as const,
      instrumentToken: 408065,
      lastPrice: 1700,
      points: 9,
      capCategory: 'LARGE' as const,
    };

    const stock = StockMapper.toDomain(dto);
    assert.equal(stock.symbol, 'INFY');
    assert.equal(stock.name, 'INFOSYS LTD');
    assert.equal(stock.exchange, 'BSE');
    assert.equal(stock.instrumentToken, 408065);
    assert.equal(stock.lastPrice, 1700);
  });
});
