require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

const mongoose = require('mongoose');

chai.use(chaiHttp);

const app = require('../src/app');
const connectToDb = require('../src/config/db');

describe('Auth API', () => {

    before(async () => {
        await connectToDb();
    });

        after(async () => {
            await mongoose.disconnect();
        });


    it('should register a new user', async () => {

    const res = await chai.request(app)
        .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'Password123'
            });

         expect(res.status).to.equal(201);
             expect(res.body).to.have.property('token');
                 expect(res.body.user).to.have.property('name', 'Test User');

    });


    it('should login an existing user', async () => {

        const email = `login${Date.now()}@example.com`;
        const password = 'Password123';


    const registerRes = await chai.request(app)
        .post('/api/auth/register')
            .send({
                name: 'Login Test User',
                email,
                password
            });


        expect(registerRes.status).to.equal(201);


        const res = await chai.request(app)
            .post('/api/auth/login')
                .send({
                   email,
                  password
            });

        expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
                 expect(res.body.user).to.have.property('email', email);

    });


    it('should get current user profile with valid token', async () => {

        const email = `profile${Date.now()}@example.com`;
        const password = 'Password123';


        const registerRes = await chai.request(app)
            .post('/api/auth/register')
                 .send({
                name: 'Profile Test User',
                email,
                password
            });

        expect(registerRes.status).to.equal(201);


        const loginRes = await chai.request(app)
            .post('/api/auth/login')
              .send({
                email,
                password
            });

        expect(loginRes.status).to.equal(200);
        expect(loginRes.body).to.have.property('token');

        const token = loginRes.body.token;


        const res = await chai.request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);


        expect(res.status).to.equal(200);
         expect(res.body).to.have.property('message', 'current user');
          expect(res.body.user).to.have.property('name', 'Profile Test User');
           expect(res.body.user).to.have.property('email', email);

    });


    it('should reject password longer than 72 bytes', async () => {

        const longPassword = 'a'.repeat(73);

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'Long Password User',
                email: `longpassword${Date.now()}@example.com`,
                password: longPassword
            });


        expect(res.status).to.equal(400);

        expect(res.body).to.have.property(
            'message',
            'Password must not exceed 72 bytes'
        );

    });


    it('should reject duplicate email registration', async () => {

        const email = `duplicate${Date.now()}@example.com`;


        const firstRes = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'First User',
                email,
                password: 'Password123'
            });

        expect(firstRes.status).to.equal(201);


        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'Second User',
                email,
                password: 'Password123'
            });

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property(
            'message',
            'user already Registered'
        );

    });

});