import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'Please add candidate full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true
  },
  status: {
    type: String,
    enum: ['rejected', 'ongoing', 'selected', 'scheduled'],
    default: 'ongoing',
    required: true
  },
  position: {
    type: String,
    required: [true, 'Please specify the position'],
    trim: true
  },
  experience: {
    type: Number,
    default: 0
  },
  resume_URL: {
    type: String,
    default: null
  },
  notes: {
    type: String
  },
  interviewDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export default mongoose.model('Candidate', candidateSchema);