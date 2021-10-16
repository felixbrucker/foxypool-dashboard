import { Injectable } from '@angular/core';
import { generate as generateShortId } from 'shortid';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  async shareData(pools) {
    const shareKey = generateShortId();
    await axios.post('/api/export', {
      shareKey,
      pools,
    });

    return shareKey;
  }

  async getData(shareKey) {
    const { data } = await axios.get('/api/import', {
      params: {
        shareKey,
      },
    });

    return data;
  }
}
