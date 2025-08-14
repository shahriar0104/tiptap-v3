import { Router } from 'express';
import authRoutes from './authRoutes';
import boardMeetingRoutes from './boardMeetingRoutes';
import agendaRoutes from './agendaRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/board-meetings', boardMeetingRoutes);
router.use('/agenda', agendaRoutes);

export default router;
