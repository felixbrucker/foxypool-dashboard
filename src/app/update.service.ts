import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(swUpdate: SwUpdate) {
    swUpdate.available.subscribe(async () => {
      await swUpdate.activateUpdate();
      document.location.reload();
    });
  }
}
