import { Injectable } from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {StatsService} from "./stats.service";

@Injectable({
  providedIn: 'root'
})
export class PoolsService {

  private _pools;

  public readonly _availablePools = [
    {
      group: 'BHD',
      name: 'Foxy-Pool BHD',
      url: 'https://bhd.foxypool.cf',
    },{
      group: 'BHD',
      name: 'Big Hard Deck',
      url: 'https://big-hard-deck.foxypool.cf',
    },{
      group: 'BOOM',
      name: 'Foxy-Pool BOOM',
      url: 'https://boom.foxypool.cf',
    },{
      group: 'BOOM',
      name: 'BOOMbastic-1',
      url: 'https://boombastic-1.foxypool.cf',
    },{
      group: 'BTB',
      name: 'Foxy-Pool BTB',
      url: 'https://btb.foxypool.cf',
    },{
      group: 'BTB',
      name: 'Foxy-Pool BTB Pledged',
      url: 'https://btb-pledged.foxypool.cf',
    },{
      group: 'BURST',
      name: 'Foxy-Pool BURST',
      url:  'https://burst.foxypool.cf',
    },{
      group: 'DISC',
      name: 'Foxy-Pool DISC',
      url: 'https://disc.foxypool.cf:8443',
    },{
      group: 'HDD',
      name: 'Foxy-Pool HDD',
      url: 'https://hdd.foxypool.cf:8443',
    },{
      group: 'HDD',
      name: 'Foxy-Pool HDD Pledged',
      url: 'https://hdd-pledged.foxypool.cf:8443',
    },{
      group: 'LAVA',
      name: 'Foxy-Pool LAVA',
      url: 'https://lava.foxypool.cf:8443',
    },{
      group: 'LHD',
      name: 'Foxy-Pool LHD',
      url: 'https://lhd.foxypool.cf',
    },{
      group: 'LHD',
      name: 'Long Hard Deck',
      url: 'https://long-hard-deck.foxypool.cf',
    },{
      group: 'XHD',
      name: 'Foxy-Pool XHD',
      url: 'https://xhd.foxypool.cf:8443',
    },{
      group: 'XHD',
      name: 'Foxy-Pool XHD Pledged',
      url: 'https://xhd-pledged.foxypool.cf:8443',
    },
  ];

  constructor(private localStorageService: LocalStorageService) {
    this.init();
  }

  init() {
    const configuredPoolsString = this.localStorageService.getItem('configuredPools');
    if (!configuredPoolsString) {
      this._pools = [];
    } else {
      this._pools = JSON.parse(configuredPoolsString);
    }
    this._pools = this._pools.map(pool => {
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
      };
      statsService.poolConfigSubject.asObservable().subscribe((poolConfig => configuredPool.poolConfig = poolConfig));
      statsService.poolStatsSubject.asObservable().subscribe((poolStats => configuredPool.poolStats = poolStats));
      statsService.roundStatsSubject.asObservable().subscribe((roundStats => configuredPool.roundStats = roundStats));
      statsService.liveStatsSubject.asObservable().subscribe((liveStats => configuredPool.liveStats = liveStats));

      return configuredPool;
    });
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
    }));
  }

  addPool(poolToAdd) {
    const exists = this._pools.find(pool => pool.url === poolToAdd.url);
    if (exists) {
      exists.payoutAddresses.push(poolToAdd.payoutAddresses[0]);
    } else {
      this._pools.push(poolToAdd);
      this._pools.sort((a, b) => {
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

    this.persistPools();
  }

  removeMiner(pool, payoutAddress) {
    pool.payoutAddresses = pool.payoutAddresses.filter(address => address !== payoutAddress);
    if (pool.payoutAddresses.length === 0) {
      this._pools = this._pools.filter(curr => curr !== pool);
    }
    this.persistPools();
  }
}
