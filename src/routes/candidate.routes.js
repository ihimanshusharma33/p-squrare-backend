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
import { uploadResume } from '../utils/fileUpload.js';

const router = express.Router();

// No longer applying authentication middleware to all routes
// Only applying to create operations that require a user ID
// router.use(protect);

// Routes for filtering by status and position
router.get('/status/:status', getCandidatesByStatus);
router.get('/position/:position', getCandidatesByPosition);

// Admin specific route for updating candidate status - still needs protection for getting the user role
router.put('/:id/status', protect, updateCandidateStatus);

// Basic CRUD routes
router.route('/')
  .get(getCandidates)
  .post(protect, uploadResume, createCandidate);  // Create still needs authentication to capture user ID

router.route('/:id')
  .get(getCandidate)
  .put(updateCandidate)  // No longer requires authentication
  .delete(deleteCandidate);  // No longer requires authentication

export default router;