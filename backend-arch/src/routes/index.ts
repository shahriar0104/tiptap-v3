import { Router } from 'express';
import authRoutes from './authRoutes';
import boardMeetingRoutes from './boardMeetingRoutes';
import agendaRoutes from './agendaRoutes';
import { createEditorContentRoutes } from './editorContentRoutes';
import { createUploadRoutes } from './uploadRoutes';
import { container } from '../container';

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
router.use('/editor-content', createEditorContentRoutes(container.editorContentController));
router.use('/uploads', createUploadRoutes(container.uploadController));

export default router;
