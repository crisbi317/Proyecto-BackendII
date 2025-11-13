import {router} from 'express';
import User from '../dao/models/userModel.js';
import { hashPassword } from '../utils/passwordUtil.js';

router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = new User({ ...req.body, password: hashPassword(req.body.password) });
  await user.save();
  res.status(201).json(user);
});

router.put('/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.sendStatus(204);
});

router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});