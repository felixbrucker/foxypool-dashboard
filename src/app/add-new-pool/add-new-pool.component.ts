import {Component, OnInit} from '@angular/core';
import {StatsService} from "../stats.service";
import {PoolsService} from "../pools.service";
import {SharingService} from "../sharing.service";
import {LocalStorageService} from "../local-storage.service";

@Component({
  selector: 'app-add-new-pool',
  templateUrl: './add-new-pool.component.html',
  styleUrls: ['./add-new-pool.component.scss']
})
export class AddNewPoolComponent implements OnInit {

  public selectedPool = null;
  private _topic;

  constructor(
    private poolsService: PoolsService,
    private sharingService: SharingService,
    private localStorageService: LocalStorageService,
  ) { }

  ngOnInit() {}

  get availablePools() {
    return this.poolsService.availablePools;
  }

  getPool(index) {
    if (index < 0 || index >= this.availablePools.length) {
      return null;
    }

    return this.availablePools[index];
  }

  selectPool(pool) {
    this.selectedPool = JSON.parse(JSON.stringify(pool));
  }

  addPool() {
    this.selectedPool.payoutAddress = this.selectedPool.payoutAddress.trim();
    const statsService = new StatsService(this.selectedPool.url);

    const configuredPool = {
      url: this.selectedPool.url,
      name: this.selectedPool.name,
      group: this.selectedPool.group,
      payoutAddresses: [this.selectedPool.payoutAddress],
      poolConfig: statsService.poolConfigSubject.getValue(),
      poolStats: statsService.poolStatsSubject.getValue(),
      roundStats: statsService.roundStatsSubject.getValue(),
      liveStats: statsService.liveStatsSubject.getValue(),
    };
    statsService.poolConfigSubject.asObservable().subscribe((poolConfig => configuredPool.poolConfig = poolConfig));
    statsService.poolStatsSubject.asObservable().subscribe((poolStats => configuredPool.poolStats = poolStats));
    statsService.roundStatsSubject.asObservable().subscribe((roundStats => configuredPool.roundStats = roundStats));
    statsService.liveStatsSubject.asObservable().subscribe((liveStats => configuredPool.liveStats = liveStats));

    this.poolsService.addPool(configuredPool);
    this.selectedPool = null;
  }

  async importConfig() {
    const pools: any = await this.sharingService.getData(this.topic);
    this.localStorageService.setItem('configuredPools', JSON.stringify(pools));
    this.poolsService.init();
    this.topic = null;
  }

  async exportConfig() {
    const {topic, clientClosedPromise} = await this.sharingService.shareData(this.poolsService.poolsAsJSON);
    this.topic = topic;
    await clientClosedPromise;
    this.topic = null
  }

  get topic() {
    return this._topic;
  }

  set topic(value) {
    this._topic = value;
  }
}
