import axios, {AxiosInstance} from 'axios';

export class ApiService {
  private client: AxiosInstance = axios.create({
    baseURL: `https://api.foxypool.io/api/stats`,
  });

  async getPoolConfig({ poolIdentifier }) {
    const { data } = await this.client.get(`${poolIdentifier}/config`);

    return data;
  }

  async getPoolStats({ poolIdentifier }) {
    const { data } = await this.client.get(`${poolIdentifier}/pool`);

    return data;
  }

  async getRoundStats({ poolIdentifier }) {
    const { data } = await this.client.get(`${poolIdentifier}/round`);

    return data;
  }
}
