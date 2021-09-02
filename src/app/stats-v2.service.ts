import {BehaviorSubject} from 'rxjs';
import {ApiService} from './api.service';

export class StatsV2Service {
  private apiService: ApiService = new ApiService();
  private statsPerPoolIdentifier = {};
  private poolIdentifier = [];

  async setPoolIdentifier(poolIdentifier) {
    this.poolIdentifier = poolIdentifier;
    this.statsPerPoolIdentifier = {};
    this.poolIdentifier.forEach(poolIdentifier => {
      this.statsPerPoolIdentifier[poolIdentifier] = {
        poolConfig: new BehaviorSubject<any>({}),
        poolStats: new BehaviorSubject<any>({}),
        roundStats: new BehaviorSubject<any>({}),
      };
    });
    this.init();
  }

  init() {
    if (!this.poolIdentifier) {
      return;
    }
    this.poolIdentifier.forEach(poolIdentifier => {
      this.initForPoolIdentifier(poolIdentifier);
      setInterval(this.updatePoolConfig.bind(this, poolIdentifier), 60 * 60 * 1000);
      setInterval(this.updatePoolStats.bind(this, poolIdentifier), 31 * 1000);
      setInterval(this.updateRoundStats.bind(this, poolIdentifier), 31 * 1000);
    });
  }

  async initForPoolIdentifier(poolIdentifier) {
    await Promise.all([
      this.updatePoolConfig(poolIdentifier),
      this.updatePoolStats(poolIdentifier),
      this.updateRoundStats(poolIdentifier),
    ]);
  }

  async updatePoolConfig(poolIdentifier) {
    this.onNewPoolConfig(poolIdentifier, await this.apiService.getPoolConfig({ poolIdentifier }));
  }

  async updatePoolStats(poolIdentifier) {
    this.onNewPoolStats(poolIdentifier, await this.apiService.getPoolStats({ poolIdentifier }));
  }

  async updateRoundStats(poolIdentifier) {
    this.onNewRoundStats(poolIdentifier, await this.apiService.getRoundStats({ poolIdentifier }));
  }

  getPoolConfigSubject(poolIdentifier) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return new BehaviorSubject<any>({});
    }
    return stats.poolConfig;
  }

  getPoolStatsSubject(poolIdentifier) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return new BehaviorSubject<any>({});
    }
    return stats.poolStats;
  }

  getRoundStatsSubject(poolIdentifier) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return new BehaviorSubject<any>({});
    }
    return stats.roundStats;
  }

  onNewPoolConfig(poolIdentifier, poolConfig) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return;
    }
    stats.poolConfig.next(poolConfig);
  }

  onNewPoolStats(poolIdentifier, poolStats) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return;
    }
    stats.poolStats.next(poolStats);
  }

  onNewRoundStats(poolIdentifier, roundStats) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return;
    }
    stats.roundStats.next(roundStats);
  }
}
