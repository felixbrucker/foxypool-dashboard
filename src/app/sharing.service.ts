import { Injectable } from '@angular/core';
// @ts-ignore
import Peer from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  constructor() {}

  async shareData(data) {
    const peer = new Peer();
    peer.on('connection', async (conn) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      conn.send(data);
    });

    await new Promise(resolve => peer.on('open', resolve));

    return peer.id;
  }

  async getData(peerId) {
    const peer = new Peer();
    const conn = peer.connect(peerId);
    const data = await new Promise(resolve => {
      conn.on('open', () => {
        conn.on('data', (data) => {
          resolve(data);
        });
      });
    });
    peer.destroy();

    return data;
  }
}
