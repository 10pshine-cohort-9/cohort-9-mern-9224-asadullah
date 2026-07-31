require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

const mongoose = require('mongoose');

chai.use(chaiHttp);

const app = require('../src/app');
const connectToDb = require('../src/config/db');

describe('Auth API', function () {

    before(async () => {

        try {
            this.timeout(10000)
            await connectToDb();
            
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
            
        }
    });

        after(async () => {

            try {
                await mongoose.disconnect();
                
            } catch (error) {
                    throw new Error(`Database disconnection failed: ${error.message}`);
                
            }
        });


    it('should register a new user', async () => {
        try {
            
       

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

             } catch (error) {
                throw new Error(`User registration test failed: ${error.message}`);
            
        }

    });


    it('should login an existing user', async () => {

        try {
            
     

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

                } catch (error) {
                    throw new Error(`User login test failed: ${error.message}`);
            
        }

    });


    it('should get current user profile with valid token', async () => {

        try {
            
     

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

              } catch (error) {
                throw new Error(`Current user profile test failed: ${error.message}`);
            
        }

    });


    it('should reject password longer than 72 bytes', async () => {

        try {
            
       

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

         } catch (error) {
            throw new Error(`Long password validation test failed: ${error.message}`);
        }

    });


    it('should reject duplicate email registration', async () => {

        try {
            
       

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

         } catch (error) {
            throw new Error(`Duplicate email registration test failed: ${error.message}`);
            
        }

        

    });

    

    

});