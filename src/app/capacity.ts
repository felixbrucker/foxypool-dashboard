export default class Capacity {
  private readonly capacityInGiB: number;

  constructor(capacityInGiB: number) {
    this.capacityInGiB = capacityInGiB;
  }

  static fromTiB(capacityInTiB): Capacity {
    return new Capacity(parseFloat(capacityInTiB) * 1024);
  }

  toString(precision = 2): string {
    let capacity = this.capacityInGiB;
    let unit = 0;
    const units = ['GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    while (capacity >= 1024) {
      capacity /= 1024;
      unit += 1;
    }

    return `${capacity.toFixed(precision)} ${units[unit]}`;
  }
}
