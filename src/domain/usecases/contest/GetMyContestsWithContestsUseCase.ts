/**
 * Use Case: Get My Contests With Embedded Contest Data
 * Uses the N+1-free endpoint that returns contest metadata inline
 */

import { Contest, ContestEntry } from '../../entities/Contest';
import { ContestRepository } from '../../repositories/ContestRepository';

export class GetMyContestsWithContestsUseCase {
  constructor(private readonly contestRepository: ContestRepository) {}

  async execute(): Promise<{ entries: ContestEntry[]; contests: Contest[] }> {
    return this.contestRepository.getMyContestsWithContests();
  }
}
