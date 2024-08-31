import { caching } from 'cache-manager';

const memoryCache = caching('memory', {
  max: 100,
  ttl: 10,
});

export const getCache = async (key: string) => {
  return (await memoryCache).get(key);
};
export const setCache = async (key: string, value: string, ttl: number) => {
  return (await memoryCache).set(key, value, ttl);
};
