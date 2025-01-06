import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import './db.mjs';

const User = mongoose.model("User");

const startAuthenticatedSession = async (req, user) => {
  try {
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else {
          req.session.user = user;
          resolve(user);
        }
      });
    });
  } catch (err) {
    throw new Error(`Session start failed: ${err.message}`);
  }
};

const endAuthenticatedSession = async (req) => {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy(err => (err ? reject(err) : resolve()));
    });
  } catch (err) {
    throw new Error(`Session end failed: ${err.message}`);
  }
};

const register = async (username, email, password) => {
  if (username.length < 8 || password.length < 8) {
    throw new Error('Username and password must be at least 8 characters long');
  }

  const existingUser = await User.findOne({ username }).exec();
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  const newUser = new User({ username, password: hash, email });
  return await newUser.save();
};


const login = async (username, password) => {
  const user = await User.findOne({ username }).exec();
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    throw new Error('Passwords do not match');
  }

  return user;
};

export { startAuthenticatedSession, endAuthenticatedSession, register, login };
