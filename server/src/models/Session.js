import mongoose from 'mongoose'

// a single message inside a conversation
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],   // only these two values allowed
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const sessionSchema = new mongoose.Schema(
  {
    // ref tells Mongoose this links to the User model
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    topic: {
      type: String,
      enum: ['DSA', 'System Design', 'Behavioural'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    messages: [messageSchema], // array of messages
    isActive: {
      type: Boolean,
      default: true
    },
    score: {
      type: Number,
      default: null  // filled when session ends
    }
  },
  {
    timestamps: true
  }
)

const Session = mongoose.model('Session', sessionSchema)
export default Session
