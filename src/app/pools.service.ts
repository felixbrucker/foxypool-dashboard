import { Injectable } from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {StatsService} from "./stats.service";
import {StatsV2Service} from "./stats-v2.service";

@Injectable({
  providedIn: 'root'
})
export class PoolsService {

  private _pools;
  private statsV2Service;

  public readonly _availablePools = [
    {
      group: 'BHD',
      name: 'Foxy-Pool BHD',
      url: 'https://bhd.foxypool.io',
      poolIdentifier: 'bhd',
    },{
      group: 'BHD',
      name: 'Foxy-Pool BHD ECO',
      url: 'https://bhd-eco.foxypool.io',
      poolIdentifier: 'bhd-eco',
    },{
      group: 'BHD',
      name: 'Foxy-Pool BHD (Testnet)',
      url:  'https://bhd-testnet.foxypool.io',
      poolIdentifier: 'bhd-testnet',
    },{
      group: 'BURST',
      name: 'Foxy-Pool BURST',
      url:  'https://burst.foxypool.io',
      poolIdentifier: 'burst',
    },{
      group: 'BURST',
      name: 'Foxy-Pool BURST (Testnet)',
      url:  'https://burst-testnet.foxypool.io',
      poolIdentifier: 'burst-testnet',
    },{
      group: 'HDD',
      name: 'Foxy-Pool HDD',
      url: 'https://hdd.foxypool.io',
      poolIdentifier: 'hdd',
    },{
      group: 'LHD',
      name: 'Foxy-Pool LHD',
      url: 'https://lhd.foxypool.io',
      poolIdentifier: 'lhd',
    },{
      group: 'XHD',
      name: 'Foxy-Pool XHD',
      url: 'https://xhd.foxypool.io',
      poolIdentifier: 'xhd',
    },
  ];

  constructor(private localStorageService: LocalStorageService) {
    this.migrateOldConfigs();
    this.init();
  }

  async init() {
    const pools = this.getConfiguredPoolsOrEmpty();
    let v1Pools = pools.filter(pool => !pool.poolIdentifier);
    let v2Pools = pools.filter(pool => !!pool.poolIdentifier);
    v1Pools = v1Pools.map(pool => {
      const statsService = new StatsService(pool.url);

      const configuredPool = {
        url: pool.url,
        name: pool.name,
        group: pool.group,
        payoutAddresses: pool.payoutAddresses,
        poolConfig: statsService.poolConfigSubject.getValue(),
        poolStats: statsService.poolStatsSubject.getValue(),
        roundStats: statsService.roundStatsSubject.getValue(),
        liveStats: statsService.liveStatsSubject.getValue(),
        statsService,
      };
      statsService.poolConfigSubject.asObservable().subscribe((poolConfig => configuredPool.poolConfig = poolConfig));
      statsService.poolStatsSubject.asObservable().subscribe((poolStats => configuredPool.poolStats = poolStats));
      statsService.roundStatsSubject.asObservable().subscribe((roundStats => configuredPool.roundStats = roundStats));
      statsService.liveStatsSubject.asObservable().subscribe((liveStats => configuredPool.liveStats = liveStats));

      return configuredPool;
    });
    if (v2Pools.length > 0) {
      if (!this.statsV2Service) {
        this.statsV2Service = new StatsV2Service();
      }
      const poolIdentifier = [...Array.from(new Set(v2Pools.map(pool => pool.poolIdentifier)))];
      await this.statsV2Service.setPoolIdentifier(poolIdentifier);
      v2Pools = v2Pools.map(pool => {
        const configuredPool = {
          url: pool.url,
          name: pool.name,
          group: pool.group,
          payoutAddresses: pool.payoutAddresses,
          poolIdentifier: pool.poolIdentifier,
          poolConfig: this.statsV2Service.getPoolConfigSubject(pool.poolIdentifier).getValue(),
          poolStats: this.statsV2Service.getPoolStatsSubject(pool.poolIdentifier).getValue(),
          roundStats: this.statsV2Service.getRoundStatsSubject(pool.poolIdentifier).getValue(),
          liveStats: this.statsV2Service.getLiveStatsSubject(pool.poolIdentifier).getValue(),
        };
        this.statsV2Service.getPoolConfigSubject(pool.poolIdentifier).asObservable().subscribe((poolConfig => configuredPool.poolConfig = poolConfig));
        this.statsV2Service.getPoolStatsSubject(pool.poolIdentifier).asObservable().subscribe((poolStats => configuredPool.poolStats = poolStats));
        this.statsV2Service.getRoundStatsSubject(pool.poolIdentifier).asObservable().subscribe((roundStats => configuredPool.roundStats = roundStats));
        this.statsV2Service.getLiveStatsSubject(pool.poolIdentifier).asObservable().subscribe((liveStats => configuredPool.liveStats = liveStats));

        return configuredPool;
      });
    }
    const allPools = v1Pools.concat(v2Pools);
    this.sortPools(allPools);
    this._pools = allPools;
  }

  migrateOldConfigs() {
    const pools = this.getConfiguredPoolsOrEmpty();
    if (pools.length === 0) {
      return;
    }
    pools.forEach(pool => {
      if (pool.url.indexOf('foxypool.cf') !== -1) {
        pool.url = pool.url.replace('.cf', '.io');
      }
      if (pool.url.indexOf('burst.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://burst.foxypool.io';
        pool.poolIdentifier = 'burst';
      }
      if (pool.url.indexOf('hdd.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://hdd.foxypool.io';
        pool.poolIdentifier = 'hdd';
      }
      if (pool.url.indexOf('lhd.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://lhd.foxypool.io';
        pool.poolIdentifier = 'lhd';
      }
      if (pool.url.indexOf('xhd.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://xhd.foxypool.io';
        pool.poolIdentifier = 'xhd';
      }
      if (pool.url.indexOf('bhd.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://bhd.foxypool.io';
        pool.poolIdentifier = 'bhd';
      }
      if (pool.url.indexOf('bhd-eco.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://bhd-eco.foxypool.io';
        pool.poolIdentifier = 'bhd-eco';
      }
    });
    this.sortPools(pools);
    this.localStorageService.setItem('configuredPools', JSON.stringify(pools));
  }

  getConfiguredPoolsOrEmpty() {
    const configuredPoolsString = this.localStorageService.getItem('configuredPools');
    if (!configuredPoolsString) {
      return [];
    }
    let pools = [];
    try {
      pools = JSON.parse(configuredPoolsString);
    } catch (err) {
      return [];
    }
    if (!Array.isArray(pools)) {
      return [];
    }

    return pools;
  }

  get pools() {
    return this._pools;
  }

  get availablePools() {
    return this._availablePools;
  }

  persistPools() {
    this.localStorageService.setItem('configuredPools', JSON.stringify(this.poolsAsJSON));
  }

  get poolsAsJSON() {
    return this.pools.map(pool => ({
      url: pool.url,
      name: pool.name,
      group: pool.group,
      payoutAddresses: pool.payoutAddresses,
      poolIdentifier: pool.poolIdentifier,
    }));
  }

  addPool(poolToAdd) {
    const exists = this._pools.find(pool => pool.url === poolToAdd.url);
    if (exists) {
      exists.payoutAddresses.push(poolToAdd.payoutAddresses[0]);
      this.persistPools();
    } else {
      this._pools.filter(pool => !!pool.statsService).forEach(pool => pool.statsService.close());
      const pools = this.poolsAsJSON;
      pools.push(poolToAdd);
      this.sortPools(pools);
      this.localStorageService.setItem('configuredPools', JSON.stringify(pools));
      this.init();
    }
  }

  removeMiner(pool, payoutAddress) {
    pool.payoutAddresses = pool.payoutAddresses.filter(address => address !== payoutAddress);
    if (pool.payoutAddresses.length === 0) {
      this._pools = this._pools.filter(curr => curr !== pool);
    }
    this.persistPools();
  }

  sortPools(pools) {
    pools.sort((a, b) => {
      if (a.group < b.group) {
        return -1;
      }
      if (a.group > b.group) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }
}
