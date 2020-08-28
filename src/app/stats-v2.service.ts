import {WebsocketService} from './websocket.service';
import {BehaviorSubject} from 'rxjs';

export class StatsV2Service {

  private websocketService: WebsocketService;
  private statsPerPoolIdentifier = {};
  private poolIdentifier = [];

  constructor() {
    this.websocketService = new WebsocketService('https://api.foxypool.io/web-ui');
    this.websocketService.subscribe('connect', this.onConnected.bind(this));
    this.websocketService.subscribe('stats/pool', this.onNewPoolStats.bind(this));
    this.websocketService.subscribe('stats/round', this.onNewRoundStats.bind(this));
    this.websocketService.subscribe('stats/live', this.onNewLiveStats.bind(this));
  }

  async setPoolIdentifier(poolIdentifier) {
    this.poolIdentifier = poolIdentifier;
    this.statsPerPoolIdentifier = {};
    this.poolIdentifier.forEach(poolIdentifier => this.statsPerPoolIdentifier[poolIdentifier] = {
      poolConfig: new BehaviorSubject<any>({}),
      poolStats: new BehaviorSubject<any>({}),
      roundStats: new BehaviorSubject<any>({}),
      liveStats: new BehaviorSubject<any>({}),
    });
    await this.subscribeToPools();
    this.init();
  }

  subscribeToPools() {
    return new Promise(resolve => this.websocketService.publish('subscribe', this.poolIdentifier, resolve));
  }

  init() {
    if (!this.poolIdentifier) {
      return;
    }
    this.poolIdentifier.forEach(poolIdentifier => {
      this.websocketService.publish('stats/init', poolIdentifier, ([poolConfig, poolStats, roundStats, liveStats]) => {
        this.onNewPoolConfig(poolIdentifier, poolConfig);
        this.onNewPoolStats(poolIdentifier, poolStats);
        this.onNewRoundStats(poolIdentifier, roundStats);
        this.onNewLiveStats(poolIdentifier, liveStats);
      });
    });
  }

  onConnected() {
    this.init();
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

  getLiveStatsSubject(poolIdentifier) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return new BehaviorSubject<any>({});
    }
    return stats.liveStats;
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

  onNewLiveStats(poolIdentifier, liveStats) {
    const stats = this.statsPerPoolIdentifier[poolIdentifier];
    if (!stats) {
      return;
    }
    stats.liveStats.next(liveStats);
  }
}
