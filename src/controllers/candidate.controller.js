import Candidate from '../models/candidate.model.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Candidate.find(JSON.parse(queryStr)).populate({
      path: 'createdBy',
      select: 'name email'
    });
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Candidate.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const candidates = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      pagination,
      data: candidates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidates by status
// @route   GET /api/candidates/status/:status
// @access  Private
export const getCandidatesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['rejected', 'ongoing', 'selected', 'scheduled'];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`, 400)
      );
    }
    
    const candidates = await Candidate.find({ status }).populate({
      path: 'createdBy',
      select: 'name email'
    });
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidates by position
// @route   GET /api/candidates/position/:position
// @access  Private
export const getCandidatesByPosition = async (req, res, next) => {
  try {
    const { position } = req.params;
    
    // Case insensitive search for position
    const candidates = await Candidate.find({
      position: { $regex: new RegExp(position, 'i') }
    }).populate({
      path: 'createdBy',
      select: 'name email'
    });
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
export const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate({
      path: 'createdBy',
      select: 'name email'
    });
    
    if (!candidate) {
      return next(
        new ErrorResponse(`Candidate not found with id of ${req.params.id}`, 404)
      );
    }
    
    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new candidate
// @route   POST /api/candidates
// @access  Private
export const createCandidate = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    // Handle the resume file if it exists
    if (req.file) {
      // Store the binary data and filename
      req.body.resume_file = req.file.buffer;
      req.body.resume_filename = req.file.originalname;
    }
    
    // Create the candidate record
    const candidate = await Candidate.create(req.body);
    
    // Don't send the binary resume data back in the response
    const responseCandidate = candidate.toObject();
    if (responseCandidate.resume_file) {
      responseCandidate.resume_file = 'Binary data not shown';
    }
    
    res.status(201).json({
      success: true,
      data: responseCandidate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private
export const updateCandidate = async (req, res, next) => {
  try {
    let candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return next(
        new ErrorResponse(`Candidate not found with id of ${req.params.id}`, 404)
      );
    }
    
    // Check if user is admin if trying to update status
    if (req.body.status && req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Only admins can change candidate status', 403)
      );
    }
    
    candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate status
// @route   PUT /api/candidates/:id/status
// @access  Private (Admin only)
export const updateCandidateStatus = async (req, res, next) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Only admins can update candidate status', 403)
      );
    }
    
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['rejected', 'ongoing', 'selected', 'scheduled'];
    if (!status || !validStatuses.includes(status)) {
      return next(
        new ErrorResponse(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`, 400)
      );
    }
    
    let candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return next(
        new ErrorResponse(`Candidate not found with id of ${req.params.id}`, 404)
      );
    }
    
    candidate = await Candidate.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
export const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return next(
        new ErrorResponse(`Candidate not found with id of ${req.params.id}`, 404)
      );
    }
    
    await candidate.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};