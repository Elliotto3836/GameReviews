// import bcrypt from 'bcryptjs';
// import mongoose from 'mongoose';
// import './db.mjs';
// import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';

// const User = mongoose.model("User");

// const startAuthenticatedSession = async (req, user) => {
//   try {
//     await new Promise((resolve, reject) => {
//       req.session.regenerate((err) => {
//         if (err) reject(err);
//         else {
//           req.session.user = user;
//           resolve(user);
//         }
//       });
//     });
//   } catch (err) {
//     throw new Error(`Session start failed: ${err.message}`);
//   }
// };

// const endAuthenticatedSession = async (req) => {
//   try {
//     await new Promise((resolve, reject) => {
//       req.session.destroy(err => (err ? reject(err) : resolve()));
//     });
//   } catch (err) {
//     throw new Error(`Session end failed: ${err.message}`);
//   }
// };

// const register = async (username, email, password) => {
//   if (username.length < 8 || password.length < 8) {
//     throw new Error('Username and password must be at least 8 characters long');
//   }

//   const existingUser = await User.findOne({ username }).exec();
//   if (existingUser) {
//     throw new Error('Username already exists');
//   }

//   const salt = bcrypt.genSaltSync();
//   const hash = bcrypt.hashSync(password, salt);

//   const newUser = new User({ username, password: hash, email });
//   return await newUser.save();
// };


// const login = async (username, password) => {
//   const user = await User.findOne({ username }).exec();
//   if (!user) {
//     throw new Error('User not found');
//   }

//   const passwordMatch = bcrypt.compareSync(password, user.password);
//   if (!passwordMatch) {
//     throw new Error('Passwords do not match');
//   }

//   return user;
// };

// export { startAuthenticatedSession, endAuthenticatedSession, register, login };


// passport.use(new LocalStrategy(
//   async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username }).exec();
//       if (!user) return done(null, false, { message: 'User not found' });

//       const passwordMatch = bcrypt.compareSync(password, user.password);
//       if (!passwordMatch) return done(null, false, { message: 'Incorrect password' });

//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import './db.mjs';

const User = mongoose.model("User");

// Configure Passport with a Local Strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) return done(null, false, { message: 'User not found' });

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Register function (no major changes)
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

// Logout function (Passport handles session management)
const logout = (req) => {
  req.logout((err) => {
    if (err) {
      throw new Error(`Logout failed: ${err.message}`);
    }
  });
};

export { register, logout, passport };
