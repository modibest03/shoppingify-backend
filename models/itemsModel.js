import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name of item'],
    trim: true,
    maxlength: [30, 'An item must have less than 30 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please provide category of item'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  count: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  note: String,
  image: String,
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Item must belong to a user'],
  },
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
