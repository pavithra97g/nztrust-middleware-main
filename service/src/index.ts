import express, { Request, Response, NextFunction } from 'express';
import { config } from './config';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';

const app = express();

app.use(express.json());

//* Routes
app.use('/api', authRoutes);
app.use('/', dataRoutes);

//* Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//! 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

//* Start server
app.listen(config.PORT, () => {
  console.log(`Service running on port ${config.PORT}`);
});

export default app;