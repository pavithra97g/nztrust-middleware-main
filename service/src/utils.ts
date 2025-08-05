import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from './types';
import { config } from './config';

export const generateToken = (user: User): string => {
  const payload = { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  };
  
  const options: SignOptions = { 
    expiresIn: config.TOKEN_EXPIRY as jwt.SignOptions['expiresIn']
  };
  
  return jwt.sign(payload, config.JWT_SECRET, options);
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};