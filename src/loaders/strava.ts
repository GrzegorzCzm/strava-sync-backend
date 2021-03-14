import axios, { AxiosInstance } from 'axios';
import config from '../config';

const TIMEOUT = 10000;

export default async (): Promise<AxiosInstance> =>
  axios.create({
    baseURL: config.urls.STRAVA_BASE_URL,
    timeout: TIMEOUT,
    headers: {},
  });
