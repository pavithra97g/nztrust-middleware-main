import { Response } from 'express';
import { AuthenticatedRequest } from '../types';

export const getData = (req: AuthenticatedRequest, res: Response): void => {
  res.json({ 
    data: 'Protected cloud resource accessed!',
    user: req.user
  });
};

export const getProfile = (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    message: 'Profile data',
    user: req.user
  });
};