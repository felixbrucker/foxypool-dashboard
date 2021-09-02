import {Component, OnInit} from '@angular/core';
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
  private _shareKey;

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
    this.selectedPool.payoutAddresses = [this.selectedPool.payoutAddress.trim()];
    this.poolsService.addPool(JSON.parse(JSON.stringify(this.selectedPool)));
    this.selectedPool = null;
  }

  async importConfig() {
    const pools: any = await this.sharingService.getData(this.shareKey);
    this.localStorageService.setItem('configuredPools', JSON.stringify(pools));
    await this.poolsService.init();
    this.shareKey = null;
  }

  async exportConfig() {
    this.shareKey = await this.sharingService.shareData(this.poolsService.poolsAsJSON);
  }

  get shareKey() {
    return this._shareKey;
  }

  set shareKey(value) {
    this._shareKey = value;
  }
}
