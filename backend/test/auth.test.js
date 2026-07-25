require('dotenv').config();

const { expect } = require('chai');
const { request } = require('chai-http');

const app = require('../src/app');
const connectToDb = require('../src/config/db');

describe('Auth API', () => {

    before(async () => {
        await connectToDb();
    });


    it('should register a new user', async () => {

        const res = await request.execute(app)
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

        // First register the user
        await request.execute(app)
            .post('/api/auth/register')
            .send({
                name: 'Login Test User',
                email,
                password
            });


        // Then login with the same credentials
        const res = await request.execute(app)
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


        // First register the user
        await request.execute(app)
            .post('/api/auth/register')
            .send({
                name: 'Profile Test User',
                email,
                password
            });


        // Login to get JWT token
        const loginRes = await request.execute(app)
            .post('/api/auth/login')
            .send({
                email,
                password
            });


        const token = loginRes.body.token;


        // Request profile with JWT token
        const res = await request.execute(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);


        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'current user');
        expect(res.body.user).to.have.property('name', 'Profile Test User');
        expect(res.body.user).to.have.property('email', email);

    });


    it('should reject password longer than 72 bytes', async () => {

        const longPassword = 'a'.repeat(73);

        const res = await request.execute(app)
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

    await request.execute(app)
        .post('/api/auth/register')
        .send({
            name: 'First User',
            email,
            password: 'Password123'
        });

    const res = await request.execute(app)
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