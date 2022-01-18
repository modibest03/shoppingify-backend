import mongoose from 'mongoose';

const historySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [30, 'An item must have less than 30 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  complete: {
    type: Boolean,
    default: true,
  },
  shoppingHistory: {
    type: [Object],
    required: [true, 'You can not submit an empty history'],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Item must belong to a user'],
  },
});

const History = mongoose.model('History', historySchema);

export default History;
