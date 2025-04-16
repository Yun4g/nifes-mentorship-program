import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ read: 1, recipient: 1 });

// Virtual for message status
messageSchema.virtual('status').get(function() {
  if (this.deleted) return 'deleted';
  if (this.edited) return 'edited';
  return 'sent';
});

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Method to edit message
messageSchema.methods.edit = async function(newContent) {
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  await this.save();
};

// Method to delete message
messageSchema.methods.delete = async function() {
  this.deleted = true;
  this.deletedAt = new Date();
  await this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message; 