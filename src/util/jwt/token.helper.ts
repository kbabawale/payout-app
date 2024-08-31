import * as jwt from 'jsonwebtoken';

export async function generateJWT(
  payload: any,
  secret: string,
  expiry: string = '1h',
): Promise<string> {
  return jwt.sign(payload, secret, {
    expiresIn: expiry,
  });
}
