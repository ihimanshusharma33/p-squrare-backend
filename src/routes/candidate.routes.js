import express from 'express';
import { 
  getCandidates, 
  getCandidate, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate,
  getCandidatesByStatus,
  getCandidatesByPosition,
  updateCandidateStatus
} from '../controllers/candidate.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes for filtering by status and position
router.get('/status/:status', getCandidatesByStatus);
router.get('/position/:position', getCandidatesByPosition);

// Admin specific route for updating candidate status
router.put('/:id/status', updateCandidateStatus);

// Basic CRUD routes
router.route('/')
  .get(getCandidates)
  .post(createCandidate);

router.route('/:id')
  .get(getCandidate)
  .put(updateCandidate)
  .delete(deleteCandidate);

export default router;