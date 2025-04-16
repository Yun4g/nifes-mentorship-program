import express from 'express';
import { auth } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   GET api/messages/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      status: { $ne: 'blocked' }
    })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/conversations/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
      deleted: false,
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route   POST api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Validate participantId
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation); // Return existing conversation
    }

    // Create a new conversation
    const conversation = new Conversation({
      participants: [req.user.id, participantId],
    });

    await conversation.save();

    // Populate participants for the response
    await conversation.populate('participants', 'name email profilePicture');

    res.status(201).json(conversation);
  } catch (err) {
    if (err.code === 11000) {
      console.error('Duplicate conversation error:', err.message);
      return res.status(400).json({ message: 'Conversation already exists' });
    }
    console.error('Error creating conversation:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route   POST api/messages/conversations/:conversationId/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:conversationId/messages', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content, type = 'text', replyTo } = req.body;
    const recipient = conversation.participants.find(p => p.toString() !== req.user.id);

    const attachments = req.files?.map(file => ({
      url: `/uploads/messages/${file.filename}`,
      type: file.mimetype,
      name: file.originalname,
      size: file.size
    })) || [];

    const message = new Message({
      sender: req.user.id,
      recipient,
      content,
      type,
      attachments,
      replyTo,
      conversationId: conversation._id
    });

    await message.save();
    await conversation.updateLastMessage(message._id);
    await conversation.incrementUnreadCount(recipient.toString());

    // Populate message details
    await message.populate('sender', 'name email avatar');
    await message.populate('recipient', 'name email avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Emit socket event
    req.app.get('io').to(recipient.toString()).emit('newMessage', message);

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/messages/:messageId
// @desc    Edit a message
// @access  Private
router.put('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.edit(req.body.content);
    await message.populate('sender', 'name email avatar');
    await message.populate('recipient', 'name email avatar');

    // Emit socket event
    req.app.get('io').to(message.recipient.toString()).emit('messageEdited', message);

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.delete();

    // Emit socket event
    req.app.get('io').to(message.recipient.toString()).emit('messageDeleted', message._id);

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/messages/conversations/:conversationId/archive
// @desc    Archive a conversation
// @access  Private
router.put('/conversations/:conversationId/archive', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await conversation.archive();

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/messages/conversations/:conversationId/block
// @desc    Block a conversation
// @access  Private
router.put('/conversations/:conversationId/block', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await conversation.block();

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/messages/conversations/:conversationId/unblock
// @desc    Unblock a conversation
// @access  Private
router.put('/conversations/:conversationId/unblock', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await conversation.unblock();

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;