import { Injectable } from '@angular/core';
import { generate as generateShortId } from 'shortid';
import { connectAsync } from '../../lib/browser-async-mqtt';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  private mqttServer = 'wss://test.mosquitto.org:8081';

  constructor() {}

  async shareData(data) {
    const client = await connectAsync(this.mqttServer);
    const topic = generateShortId();
    await client.subscribe(topic);
    const clientClosedPromise = new Promise((resolve => {
      client.on('message', async (topic, buf) => {
        const msg = buf.toString();
        if (msg !== 'send') {
          return;
        }
        await client.publish(topic, JSON.stringify(data));
        await client.end();
        resolve();
      });
    }));

    return {topic, clientClosedPromise};
  }

  async getData(topic) {
    const client = await connectAsync(this.mqttServer);
    await client.subscribe(topic);
    const dataPromise = new Promise((resolve) => {
      client.on('message', async (topic, buf) => {
        const msg = buf.toString();
        if (msg === 'send') {
          return;
        }
        await client.end();
        resolve(JSON.parse(msg));
      });
    });

    await client.publish(topic, 'send');

    return dataPromise;
  }
}
