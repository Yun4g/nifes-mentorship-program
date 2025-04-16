import express from 'express';
import { auth } from '../middleware/auth.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST api/connections/request
// @desc    Send a connection request
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = new Connection({
      requester: req.user.id,
      recipient: recipientId
    });

    await connection.save();

    // Emit socket event for new connection request
    req.app.get('io').to(recipientId).emit('newConnectionRequest', {
      requester: req.user.id,
      requesterName: req.user.name
    });

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/:connectionId/accept
// @desc    Accept a connection request
// @access  Private
router.put('/:connectionId/accept', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    connection.status = 'accepted';
    await connection.save();

    // Emit socket event for accepted connection
    req.app.get('io').to(connection.requester.toString()).emit('connectionAccepted', {
      connectionId: connection._id,
      recipient: req.user.id,
      recipientName: req.user.name
    });

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/connections/:connectionId/reject
// @desc    Reject a connection request
// @access  Private
router.put('/:connectionId/reject', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    connection.status = 'rejected';
    await connection.save();

    // Emit socket event for rejected connection
    req.app.get('io').to(connection.requester.toString()).emit('connectionRejected', {
      connectionId: connection._id,
      recipient: req.user.id,
      recipientName: req.user.name
    });

    res.json(connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections
// @desc    Get all connections for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }]
    })
    .populate('requester', 'name email')
    .populate('recipient', 'name email');

    res.json(connections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/connections/pending
// @desc    Get pending connection requests for the current user
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const pendingConnections = await Connection.find({
      recipient: req.user.id,
      status: 'pending'
    })
    .populate('requester', 'name email');

    res.json(pendingConnections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router; 