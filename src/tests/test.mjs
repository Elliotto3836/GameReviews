/* eslint-env mocha */
/* eslint no-unused-vars: "off" */
/* eslint no-undef: "off" */



import { app } from '../app.mjs';
import { expect } from 'chai';
import request from "supertest";
import mongoose from 'mongoose';

const User = mongoose.model("User");
const Review = mongoose.model('Review');



describe('Setup', function () {
  this.timeout(10000);
    describe('GET /', async function () {
      it('should redirect to home page', async function () {
        const response = await request(app).get('/');
        expect(response.redirect).to.eql(true);
        expect(response.status).to.eql(302);
        expect(response.headers.location).to.eql('/home');
      });
  });
});

//https://www.npmjs.com/package/supertest
describe("Sign up", function (){

  
  it('should create a new user and return the user object', async () => {
    let agent = request.agent(app);
    
    const userData = {
      username: 'newUserTest2!',
      password: "testing!",
      email: 'userTesting@testing.com'
    };


    const response = await request(app).post('/register').send(userData);

    const login = await agent.post('/login').send({
      username: userData.username,
      password: userData.password,
    })

    expect(response.status).to.equal(302);
    expect(response.body).to.be.an('object');
    const home = await agent.get('/home').expect(200);
    expect(home.text).to.include('Logged in as: newUserTest2!');

  });
});

describe("Log in", function(){
  it("should be able to log in ", async()=>{
    let agent = request.agent(app);
    
    const userData = {
      username: 'newUserTest2!',
      password: "testing!",
    };


    const response = await agent.post('/login').send(userData);
    const home = await agent.get('/home').expect(200);

    expect(response.status).to.equal(302);

  })
})

describe("Posting", function (){
  
  it('should be able to post a review', async () => {
    let agent = request.agent(app);
    
    const userData = {
      username: 'newUserTest2!',
      password: "testing!",
    };


    const response = await agent.post('/login').send(userData);

    const reviewTemplate={
      gameTitle: "Big test adventure",
      platform: "Chrome",
      developer: "Elliot",
      reviewText: "Testing review",
      hours: 99,
      rating: 10,
    }

    const postResponse = await agent.post('/postReview').send(reviewTemplate);
    const home = await agent.get('/home').expect(200);

    expect(response.status).to.equal(302);
    expect(postResponse.status).to.equal(200);
    expect(home.status).to.equal(200);

  });
});


describe("API", function (){  
  it('should return valid JSON from the api', async function(){
    const response = await request(app).get('/api/reviews');
    expect(response.status).to.eql(200);
    expect(response.header['content-type']).to.include('application/json');
  });

  after(async function () {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
      console.log('Test database dropped');
    }
    await mongoose.connection.close();
  });
});

