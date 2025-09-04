/* eslint-env mocha */
/* eslint no-unused-vars: "off" */
/* eslint no-undef: "off" */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();  

import { app } from '../app.mjs';
import { expect } from 'chai';
import request from 'supertest';

import Review from '../models/Review.mjs';
import User from '../models/User.mjs';

// Connect to test DB
before(async function () {
  const mongoUri = process.env.DSN_TEST || process.env.DSN;
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear collections before each test
beforeEach(async function () {
  await Review.deleteMany({});
  await User.deleteMany({});
});

// Close DB connection after all tests
after(async function () {
  await mongoose.connection.close();
});

// Helper functions
async function signupAndLogin(agent, userData) {
  await agent.post('/register').send(userData);
  await agent.post('/login').send(userData);
}

async function postReview(agent, review) {
  return agent.post('/postReview').send(review);
}

// ------------------- Tests -------------------

describe('Setup', function () {
  describe('GET /', function () {
    it('should redirect to home page', async function () {
      const response = await request(app).get('/');
      expect(response.status).to.eql(302);
      expect(response.headers.location).to.eql('/home');
    });
  });
});

describe('User Authentication', function () {
  const testUser = {
    username: 'newUserTest2!',
    password: 'testing!',
    email: 'userTesting@testing.com',
  };

  it('should sign up and log in a new user', async function () {
    const agent = request.agent(app);
    await signupAndLogin(agent, testUser);

    const home = await agent.get('/home').expect(200);
    expect(home.text).to.include(`Logged in as: ${testUser.username}`);
  });

  it('should log in an existing user', async function () {
    const agent = request.agent(app);
    await signupAndLogin(agent, testUser); // ensure user exists

    const response = await agent.post('/login').send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(response.status).to.equal(302);
  });
});

describe('Posting Reviews', function () {
  const testUser = {
    username: 'newUserTest2!',
    password: 'testing!',
    email: 'userTesting@testing.com',
  };

  it('should post a new review', async function () {
    const agent = request.agent(app);
    await signupAndLogin(agent, testUser);

    const reviewData = {
      gameTitle: 'Big test adventure',
      platform: 'Chrome',
      developer: 'Elliot',
      reviewText: 'Testing review',
      hours: 99,
      rating: 10,
    };

    const postResponse = await postReview(agent, reviewData);
    expect(postResponse.status).to.equal(200);

    const home = await agent.get('/home').expect(200);
    expect(home.status).to.equal(200);
  });
});

describe('API', function () {
  it('should return JSON from /api/reviews', async function () {
    const response = await request(app).get('/api/reviews');
    expect(response.status).to.eql(200);
    expect(response.header['content-type']).to.include('application/json');
  });
});
