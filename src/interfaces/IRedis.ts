export interface RedisConnection {
  getAsync: (fieldName: string) => string;
  setAsync: (fieldName: string, fieldValue: string | number | Date | null) => unknown;
}
