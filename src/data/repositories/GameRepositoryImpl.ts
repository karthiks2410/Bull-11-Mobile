/**
 * Game Repository Implementation
 * Implements domain repository interface
 */

import { GameRepository } from '@/src/domain/repositories/GameRepository';
import { Game, GameStatus } from '@/src/domain/entities/Game';
import { ApiClient } from '../api/ApiClient';
import { GameMapper } from '../mappers/GameMapper';
import { API_ENDPOINTS } from '@/src/core/constants/app.constants';
import { StartGameRequestDTO, GameDTO, GameHistoryResponseDTO, GameLiveResponseDTO } from '../api/dto';

export class GameRepositoryImpl implements GameRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async startGame(stockSymbols: string[], exchange?: string): Promise<Game> {
    const request: StartGameRequestDTO = {
      stockSymbols,
      exchange: exchange || undefined // Send exchange if provided
    };
    const gameDTO = await this.apiClient.post<GameDTO>(
      API_ENDPOINTS.GAMES.START,
      request
    );
    return GameMapper.toDomain(gameDTO);
  }

  async getGameById(gameId: string): Promise<Game> {
    const gameDTO = await this.apiClient.get<GameDTO>(
      API_ENDPOINTS.GAMES.DETAILS(gameId)
    );
    return GameMapper.toDomain(gameDTO);
  }

  async getLiveGame(gameId: string): Promise<Game> {
    const liveResponseDTO = await this.apiClient.get<GameLiveResponseDTO>(
      API_ENDPOINTS.GAMES.LIVE(gameId)
    );
    return GameMapper.liveResponseToDomain(liveResponseDTO);
  }

  async closeGame(gameId: string): Promise<Game> {
    const gameDTO = await this.apiClient.post<GameDTO>(
      API_ENDPOINTS.GAMES.CLOSE(gameId)
    );
    return GameMapper.toDomain(gameDTO);
  }

  async cancelGame(gameId: string): Promise<Game> {
    const gameDTO = await this.apiClient.post<GameDTO>(
      API_ENDPOINTS.GAMES.CANCEL(gameId)
    );
    return GameMapper.toDomain(gameDTO);
  }

  async getGameHistory(): Promise<Game[]> {
    const historyResponse = await this.apiClient.get<GameHistoryResponseDTO>(
      API_ENDPOINTS.GAMES.HISTORY
    );

    // Convert GameSummaryDTO array to Game array
    return historyResponse.games.map(summary => {
      const game = GameMapper.summaryToDomain(summary);
      // Set userId from response
      return { ...game, userId: historyResponse.userId };
    });
  }

  async getActiveGames(): Promise<Game[]> {
    const history = await this.getGameHistory();
    return history.filter((game) => game.status === GameStatus.ACTIVE);
  }
}
