import { User, RegisterRequest } from './types';
import bcrypt from 'bcrypt';
import { config } from './config';

//ToDo: Add DB connection
const users: User[] = [];
let userIdCounter = 1;

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const createUser = async (userData: RegisterRequest): Promise<User> => {
  const hashedPassword = await bcrypt.hash(userData.password, config.BCRYPT_ROUNDS);
  
  const newUser: User = {
    id: userIdCounter++,
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
    createdAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

export const findUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

export const getAllUsers = (): User[] => {
  return users;
};