import {Component, OnInit} from '@angular/core';
import {faSortUp, faSortDown, faTrash, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import * as Capacity from '../../shared/capacity.es5';
import {PoolsService} from "../pools.service";
import * as moment from "moment";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-pool-stats',
  templateUrl: './pool-stats.component.html',
  styleUrls: ['./pool-stats.component.scss']
})
export class PoolStatsComponent implements OnInit {

  private showDetails: any = {};
  private _sortingIcon = null;
  private _sortedColumn = null;

  public trash = faTrash;
  public faExclamationTriangle = faExclamationTriangle;

  constructor(private poolsService: PoolsService) { }

  ngOnInit() {
  }

  get pools() {
    return this.poolsService.pools;
  }

  getMiners(pool) {
    if (pool.poolStats.accounts) {
      const accounts = pool.poolStats.accounts.filter(account => pool.payoutAddresses.some(payoutAddress => payoutAddress === account.payoutAddress));
      if (accounts.length === 0) {
        return pool.payoutAddresses.map(payoutAddress => ({
          payoutAddress,
          miner: [],
          reportedCapacity: 0,
          pending: '0',
          ec: 0,
          ecShare: 0,
          pledge: '0',
          pledgeShare: 0,
          deadlines: 'N/A',
        }));
      }

      return accounts;
    }

    if (!pool.poolStats.miners) {
      return pool.payoutAddresses.map(payoutAddress => ({
        payoutAddress,
        miner: [],
        reportedCapacity: 0,
        pending: '0',
        ec: 0,
        ecShare: 0,
        pledge: '0',
        pledgeShare: 0,
        deadlines: 'N/A',
      }));
    }

    const miners = pool.poolStats.miners.filter(miner => pool.payoutAddresses.some(payoutAddress => payoutAddress === miner.payoutAddress));

    if (miners.length === 0) {
      return pool.payoutAddresses.map(payoutAddress => ({
        payoutAddress,
        miner: [],
        reportedCapacity: 0,
        pending: '0',
        ec: 0,
        ecShare: 0,
        pledge: '0',
        pledgeShare: 0,
        deadlines: 'N/A',
      }));
    }

    return miners;
  }

  get sortedColumn() {
    return this._sortedColumn;
  }

  isSortedColumn(column) {
    return this.sortedColumn == column;
  }

  get sortingIcon() {
    return this._sortingIcon
  }

  getLastPayout(pool, payoutAddress) {
    if (!pool.poolStats.payouts) {
      return null;
    }
    return pool.poolStats.payouts.find(payout => {
      if (payout.transactions) {
        return payout.transactions.some(transaction => {
          return Object.keys(transaction.payoutAmounts).some(currentPayoutAddress => currentPayoutAddress === payoutAddress);
        });
      } else {
        return Object.keys(payout.addressAmountPairs).some(currentPayoutAddress => currentPayoutAddress === payoutAddress);
      }
    });
  }

  getLastPayoutDate(pool, payoutAddress) {
    const lastPayout = this.getLastPayout(pool, payoutAddress);

    return moment(lastPayout.createdAt).format('YYYY-MM-DD');
  }

  getLastPayoutTxId(pool, payoutAddress) {
    const lastPayout = this.getLastPayout(pool, payoutAddress);
    if (lastPayout.transactions) {
      return lastPayout.transactions.find(transaction => {
        return Object.keys(transaction.payoutAmounts).some(currentPayoutAddress => currentPayoutAddress === payoutAddress);
      }).txId;
    }

    return lastPayout.txId;
  }

  getBlockExplorerTransactionLink(pool, txId) {
    return pool.poolConfig.blockExplorerTxUrlTemplate.replace('#TX#', txId);
  }

  getLastPayoutAmount(pool, payoutAddress) {
    const lastPayout = this.getLastPayout(pool, payoutAddress);
    if (lastPayout.transactions) {
      const amount = lastPayout.transactions.find(transaction => {
        return Object.keys(transaction.payoutAmounts).some(currentPayoutAddress => currentPayoutAddress === payoutAddress);
      }).payoutAmounts[payoutAddress];

      return (new BigNumber(amount)).decimalPlaces(8, BigNumber.ROUND_FLOOR).toNumber();
    }

    return lastPayout.addressAmountPairs[payoutAddress];
  }

  toggleSorting(column) {
    if (this._sortedColumn === column) {
      switch(this._sortingIcon) {
        case null:
          this._sortingIcon = faSortDown;
          break;
        case faSortDown:
          this._sortingIcon = faSortUp;
          break;
        case faSortUp:
          this._sortingIcon = faSortDown;
          break;
      }
      return;
    }
    this._sortedColumn = column;
    this._sortingIcon = faSortDown;
  }

  getSortedMiners(pool) {
    const miners = this.getMiners(pool);
    if (!this.sortedColumn) {
      return miners;
    }
    const asc = this.sortingIcon === faSortUp;
    miners.sort((a, b) => {
      if (asc) {
        if (a[this.sortedColumn] < b[this.sortedColumn]) {
          return -1;
        }
        if (a[this.sortedColumn] > b[this.sortedColumn]) {
          return 1;
        }
        return 0;
      }

      if (a[this.sortedColumn] > b[this.sortedColumn]) {
        return -1;
      }
      if (a[this.sortedColumn] < b[this.sortedColumn]) {
        return 1;
      }
      return 0;
    });

    return miners;
  }

  getFormattedCapacityForMiner(miner) {
    return this.getFormattedCapacity(miner.reportedCapacity);
  }

  getFormattedCapacity(capacityInGiB) {
    if (capacityInGiB === 0) {
      return 'N/A';
    }

    return (new Capacity(capacityInGiB)).toString();
  }

  getPledgeUnit(pool) {
    if (!pool.poolConfig.pledgeUnit) {
      return '';
    }
    return pool.poolConfig.pledgeUnit;
  }

  getPledgePrecision(pool) {
    if (pool.poolConfig.pledgePrecision === undefined) {
      return 2;
    }
    return pool.poolConfig.pledgePrecision;
  }

  getPledge(pool, miner) {
    return (new BigNumber(miner.pledge || 0)).decimalPlaces(this.getPledgePrecision(pool)).toNumber();
  }

  toggleShowDetails(pool, payoutAddress) {
    this.showDetails[`${pool}/${payoutAddress}`] = !this.showDetails[`${pool}/${payoutAddress}`];
  }

  shouldShowDetails(pool, payoutAddress) {
    return !!this.showDetails[`${pool}/${payoutAddress}`];
  }

  getMachineState(pool, machine) {
    const lastSubmissionHeight = machine.lastSubmissionHeight || machine.lastSubmitHeight;
    if (pool.roundStats.round.height - lastSubmissionHeight > 6) {
      return 0;
    }
    if (pool.roundStats.round.height - lastSubmissionHeight > 3) {
      return 2;
    }

    return 1;
  }

  getMachineName(machine) {
    let name = machine.name || machine.minerName || 'Unknown';
    if (name.length > 30) {
      name = name.substr(0, 30) + '..'
    }

    return name;
  }

  removeMiner(pool, payoutAddress) {
    this.poolsService.removeMiner(pool, payoutAddress);
  }

  isMinerCheating(pool, miner) {
    if (!miner.lastCheatingHeight) {
      return false;
    }
    if (!pool.roundStats.round || !pool.poolConfig.blocksPerDay) {
      return false;
    }
    return ((pool.roundStats.round.height - miner.lastCheatingHeight) <= (pool.poolConfig.blocksPerDay * 3));
  }

  getMinerOnlineTooltip(onlineState) {
    switch (onlineState) {
      case 0: return 'No submissions within the last 6 rounds';
      case 1: return 'Online';
      case 2: return 'No submissions within the last 3 rounds';
      case 3: return 'Investor';
      default: return 'Not found';
    }
  }

  getAccountState(pool, account) {
    const lastSubmitHeight = account.lastSubmissionHeight;
    if (!lastSubmitHeight) {
      return account.pledgeShare > 0 ? 3 : 0;
    }
    if (pool.roundStats.round.height - lastSubmitHeight > 6) {
      return 0;
    }
    if (pool.roundStats.round.height - lastSubmitHeight > 3) {
      return 2;
    }

    return 1;
  }

  getPending(miner) {
    if (typeof miner.pending === 'string') {
      return (new BigNumber(miner.pending)).decimalPlaces(8, BigNumber.ROUND_FLOOR).toString();
    }

    return miner.pending.toFixed(8);
  }
}
