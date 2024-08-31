export interface JWT {
  iat: number;
  exp: number;
  type: string;
  email: string;
  payload?: {
    sub: string;
  };
}
