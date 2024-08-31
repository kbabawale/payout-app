export class ResponseFormat<T, M = {}> {
  message: string;
  data: T;
  meta?: M;
}
