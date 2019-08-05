import * as io from 'socket.io-client';

export class WebsocketService {

  private socket;

  constructor(private url: string) {
    this.socket = io(this.url, {
      reconnectionDelayMax: 25 * 1000,
    });
  }

  subscribe(topic, cb) {
    this.socket.on(topic, cb);
  }

  publish(topic, ...args) {
    this.socket.emit(topic, ...args);
  }
}
