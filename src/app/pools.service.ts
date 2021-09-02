import { Injectable } from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
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
      group: 'SIGNA',
      name: 'Foxy-Pool SIGNA',
      url:  'https://signa.foxypool.io',
      poolIdentifier: 'signa',
    },
  ];

  constructor(private localStorageService: LocalStorageService) {
    this.migrateOldConfigs();
    this.init();
  }

  async init() {
    const pools = this.getConfiguredPoolsOrEmpty();
    let v2Pools = pools.filter(pool => !!pool.poolIdentifier);
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
        };
        this.statsV2Service.getPoolConfigSubject(pool.poolIdentifier).asObservable().subscribe((poolConfig => configuredPool.poolConfig = poolConfig));
        this.statsV2Service.getPoolStatsSubject(pool.poolIdentifier).asObservable().subscribe((poolStats => configuredPool.poolStats = poolStats));
        this.statsV2Service.getRoundStatsSubject(pool.poolIdentifier).asObservable().subscribe((roundStats => configuredPool.roundStats = roundStats));

        return configuredPool;
      });
    }
    this.sortPools(v2Pools);
    this._pools = v2Pools;
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
        pool.url = 'https://signa.foxypool.io';
        pool.poolIdentifier = 'signa';
      }
      if (pool.url.indexOf('bhd.foxypool.io') !== -1 && !pool.poolIdentifier) {
        pool.url = 'https://bhd.foxypool.io';
        pool.poolIdentifier = 'bhd';
      }
      if (pool.url.indexOf('burst.foxypool.io') !== -1 && pool.poolIdentifier === 'burst') {
        pool.url = 'https://signa.foxypool.io';
        pool.poolIdentifier = 'signa';
        pool.group = 'SIGNA';
        pool.name = 'Foxy-Pool SIGNA';
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
