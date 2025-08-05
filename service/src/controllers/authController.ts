import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { LoginRequest, RegisterRequest, AuthenticatedRequest } from '../types';
import { findUserByEmail, createUser } from '../database';
import { generateToken, comparePassword } from '../utils';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { email, password, name }: RegisterRequest = req.body;

    // Check if user already exists
    if (findUserByEmail(email)) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create new user
    const newUser = await createUser({ email, password, name });
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = findUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newToken = generateToken(user);
    
    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req: AuthenticatedRequest, res: Response): void => {
  res.json({ 
    message: 'Logged out successfully. Please remove the token from client storage.' 
  });
};