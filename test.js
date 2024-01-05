const chai = require('chai');
const chaiHttp = require('chai-http');
const index = require('../index'); // Assuming your index.js is in the root directory

chai.use(chaiHttp);
const expect = chai.expect;

const loginEndpoint = '/login';
const registerEndpoint = '/register';

describe('Login Endpoint', () => {
  it('should return a redirect response on successful login', async () => {
    const res = await chai.request(index)
      .post(loginEndpoint)
      .send({
        email: 'test@example.com', // Replace with an existing user's email
        password: 'password123',   // Replace with the corresponding password
      });

    expect(res).to.have.status(302); // Expect a redirect response
  });

  it('should return a 401 status for invalid password', async () => {
    const res = await chai.request(index)
      .post(loginEndpoint)
      .send({
        email: 'test@example.com', // Replace with an existing user's email
        password: 'wrongpassword',  // Replace with an incorrect password
      });

    expect(res).to.have.status(401); // Expect a 401 Unauthorized status
  });

  it('should return a 401 status for user not found', async () => {
    const res = await chai.request(index)
      .post(loginEndpoint)
      .send({
        email: 'nonexistent@example.com', // Replace with a non-existent user's email
        password: 'password123',           // Replace with a password
      });

    expect(res).to.have.status(401); // Expect a 401 Unauthorized status
  });
});

describe('Registration Endpoint', () => {
  it('should return a redirect response on successful registration', async () => {
    const res = await chai.request(index)
      .post(registerEndpoint)
      .send({
        email: 'newuser@example.com', // Replace with a unique email not in the database
        password: 'newpassword',       // Replace with a password
      });

    expect(res).to.have.status(302); // Expect a redirect response
  });

  it('should return a 500 status on internal server error during registration', async () => {
    // Simulate an internal server error by sending an invalid request (e.g., missing required fields)
    const res = await chai.request(index)
      .post(registerEndpoint)
      .send({});

    expect(res).to.have.status(500); // Expect a 500 Internal Server Error status
  });
});
