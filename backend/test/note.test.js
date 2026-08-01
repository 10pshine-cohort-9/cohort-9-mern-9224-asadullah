require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

const mongoose = require('mongoose');

chai.use(chaiHttp);

const app = require('../src/app');
const connectToDb = require('../src/config/db');

let token;
let noteId;

let testUser = {
    name: 'Notes Test User',
    email: `notes-test-${Date.now()}@example.com`,
    password: 'Password123'
};

describe('Notes API', () => {

    before(async function () {

        try {

            this.timeout(10000)
            await connectToDb();

            const registerRes = await chai
                .request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(registerRes.status).to.equal(201);

            const loginRes = await chai
                .request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(loginRes.status).to.equal(200);

            expect(loginRes.body).to.have.property('token');

            token = loginRes.body.token;

        } catch (error) {

            throw new Error(
                `Notes API test setup failed: ${error.message}`
            );

        }

    });




    after(async () => {

        try {

            await mongoose.disconnect();

        } catch (error) {

            throw new Error(
                `Database disconnection failed: ${error.message}`
            );

        }

    });




    it('should create a new note', async () => {

        try {

            const res = await chai
                .request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Note',
                    content: 'This is a test note'
                });

            expect(res.status).to.equal(201);

            expect(res.body).to.have.property(
                'message',
                'Note Created Successfully'
            );

            expect(res.body).to.have.property('note');

            expect(res.body.note).to.have.property(
                'title',
                'Test Note'
            );

            expect(res.body.note).to.have.property(
                'content',
                'This is a test note'
            );

            noteId = res.body.note._id;

        } catch (error) {

            throw new Error(
                `Create note test failed: ${error.message}`
            );

        }

    });




    it('should reject creating a note without token', async () => {

        try {

            const res = await chai
                .request(app)
                .post('/api/notes')
                .send({
                    title: 'Unauthorized Note',
                    content: 'This should fail'
                });

            expect(res.status).to.equal(401);

        } catch (error) {

            throw new Error(
                `Unauthorized create note test failed: ${error.message}`
            );

        }

    });


    it('should reject creating a note without title', async () => {

        const res = await chai
            .request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'This note has no title'
            });

        expect(res.status).to.equal(400);

    });





    it('should reject creating a note without content', async () => {

        const res = await chai
            .request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'This note has no content'
            });

        expect(res.status).to.equal(400);

    });


    it('should get all notes of the current user', async () => {

        try {

            const res = await chai
                .request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);

            expect(res.body).to.have.property(
                'message',
                'notes fetched successfully'
            );

            expect(res.body).to.have.property('notes');

            expect(res.body.notes).to.be.an('array');

        } catch (error) {

            throw new Error(
                `Get notes test failed: ${error.message}`
            );

        }

    });




    it('should reject getting a note with invalid id', async () => {

        const res = await chai
            .request(app)
            .get('/api/notes/invalid-id')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).to.equal(400);

    });




    it('should reject updating a note without fields', async () => {

        const res = await chai
            .request(app)
            .patch(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).to.equal(400);

    });




    it('should reject updating a note with empty title', async () => {

        const res = await chai
            .request(app)
            .patch(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: '   '
            });

        expect(res.status).to.equal(400);

    });



    it('should reject getting notes without token', async () => {

        try {

            const res = await chai
                .request(app)
                .get('/api/notes');

            expect(res.status).to.equal(401);

        } catch (error) {

            throw new Error(
                `Unauthorized get notes test failed: ${error.message}`
            );

        }

    });




    it('should get a note by id', async () => {

        try {

            const res = await chai
                .request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);

            expect(res.body).to.have.property(
                'message',
                'note found successfully'
            );

            expect(res.body).to.have.property('note');

            expect(res.body.note).to.have.property(
                '_id',
                noteId
            );

        } catch (error) {

            throw new Error(
                `Get note by id test failed: ${error.message}`
            );

        }

    });




    it('should reject getting a note by id without token', async () => {

        try {

            const res = await chai
                .request(app)
                .get(`/api/notes/${noteId}`)

            expect(res.status).to.equal(401);

        } catch (error) {

            throw new Error(
                `Unauthorized get note by id test failed: ${error.message}`
            );

        }

    });



    it('should update an existing note', async () => {

        try {

            const res = await chai
                .request(app)
                .patch(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Test Note',
                    content: 'Updated test note content'
                });

            expect(res.status).to.equal(200);

            expect(res.body).to.have.property(
                'message',
                'note Updated'
            );

            expect(res.body).to.have.property('note');

            expect(res.body.note).to.have.property(
                'title',
                'Updated Test Note'
            );

            expect(res.body.note).to.have.property(
                'content',
                'Updated test note content'
            );

        } catch (error) {

            throw new Error(
                `Update note test failed: ${error.message}`
            );

        }

    });




    it('should reject updating a note without token', async () => {

        try {

            const res = await chai
                .request(app)
                .patch(`/api/notes/${noteId}`)
                .send({
                    title: 'Unauthorized Update',
                    content: 'This should fail'
                });

            expect(res.status).to.equal(401);

        } catch (error) {

            throw new Error(
                `Unauthorized update note test failed: ${error.message}`
            );

        }

    });




    it('should delete an existing note', async () => {

        try {

            const res = await chai
                .request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);

            expect(res.body).to.have.property(
                'message',
                'note deleted successfully'
            );

        } catch (error) {

            throw new Error(
                `Delete note test failed: ${error.message}`
            );

        }

    });




    it('should reject deleting a note without token', async () => {

        try {

            const res = await chai
                .request(app)
                .delete(`/api/notes/${noteId}`);

            expect(res.status).to.equal(401);

        } catch (error) {

            throw new Error(
                `Unauthorized delete note test failed: ${error.message}`
            );

        }

    });



    it('should return 404 when getting a deleted note', async () => {

        try {

            const res = await chai
                .request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(404);

        } catch (error) {

            throw new Error(
                `Deleted note test failed: ${error.message}`
            );

        }

    });

});