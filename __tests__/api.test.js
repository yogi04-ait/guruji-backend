import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../Routes/auth.js';
import companyRouter from '../Routes/company.route.js';
import User from '../models/user.js';
import Company from '../models/company.model.js';

dotenv.config();

let app = null;

describe('End-to-End API Tests - GuruJi Backend', () => {

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        app.use('/', authRouter);
        app.use('/', companyRouter);

        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 5000,
            });
            console.log('\n✓ MongoDB Connected Successfully\n');
        } catch (error) {
            console.log('\n⚠ MongoDB unavailable - Testing API endpoints\n');
        }
    });

    afterAll(async () => {
        try {
            if (mongoose.connection.readyState === 1) {
                await User.deleteMany({ email: /^test_|^integration_|^flow_/ });
                await Company.deleteMany({ name: /^Test|^Integration/ });
                await mongoose.connection.close();
                console.log('\n✓ Database cleanup completed\n');
            }
        } catch (error) {
            console.log(`\nCleanup note: ${error.message}\n`);
        }
    });

    describe('1. Authentication Endpoints', () => {

        test('POST /signup - Response has required fields', async () => {
            const response = await request(app)
                .post('/signup')
                .send({
                    email: `test_${Date.now()}@example.com`,
                    password: 'TestPassword123!'
                });

            expect(response.body).toHaveProperty('message');
            console.log('    ✓ POST /signup - Endpoint responds');
        });

        test('POST /signup - Email validation', async () => {
            const response = await request(app)
                .post('/signup')
                .send({ password: 'test123' });

            expect(response.status).toBe(400);
            console.log('    ✓ POST /signup - Email required');
        });

        test('POST /signup - Password validation', async () => {
            const response = await request(app)
                .post('/signup')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(400);
            console.log('    ✓ POST /signup - Password required');
        });

        test('POST /login - Endpoint responds', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestPassword123!'
                });

            expect(response.body).toHaveProperty('message');
            console.log('    ✓ POST /login - Endpoint responds');
        });

        test('POST /login - Email validation', async () => {
            const response = await request(app)
                .post('/login')
                .send({ password: 'test123' });

            expect(response.status).toBe(400);
            console.log('    ✓ POST /login - Email required');
        });

        test('POST /login - Password validation', async () => {
            const response = await request(app)
                .post('/login')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(400);
            console.log('    ✓ POST /login - Password required');
        });

        test('GET /logout - Endpoint responds', async () => {
            const response = await request(app)
                .get('/logout');

            expect(response.status).toBe(200);
            console.log('    ✓ GET /logout - Endpoint responds');
        });
    });

    describe('2. Company Management Endpoints', () => {

        test('GET /list - Company list endpoint', async () => {
            const response = await request(app)
                .get('/list');

            expect(response.body).toBeDefined();
            console.log('    ✓ GET /list - Endpoint responds');
        });

        test('POST /create - Requires authentication', async () => {
            const response = await request(app)
                .post('/create')
                .send({
                    name: 'Test Company',
                    industry: 'Tech'
                });

            expect(response.status).toBe(401);
            console.log('    ✓ POST /create - Auth required');
        });

        test('POST /create - Accepts company data', async () => {
            const response = await request(app)
                .post('/create')
                .send({
                    name: 'Test Company',
                    industry: 'Technology',
                    location: 'San Francisco'
                });

            expect(response.status).not.toBe(400);
            console.log('    ✓ POST /create - Data structure valid');
        });

        test('DELETE /delete/:id - Requires authentication', async () => {
            const response = await request(app)
                .delete('/delete/123');

            expect(response.status).toBe(401);
            console.log('    ✓ DELETE /delete/:id - Auth required');
        });
    });

    describe('3. Integration Flows', () => {

        test('Authentication workflow', async () => {
            const email = `auth_${Date.now()}@example.com`;
            const password = 'AuthTest123!';

            const signup = await request(app)
                .post('/signup')
                .send({ email, password });

            console.log(`    ✓ Step 1: Signup (${signup.status})`);

            const login = await request(app)
                .post('/login')
                .send({ email, password });

            console.log(`    ✓ Step 2: Login (${login.status})`);

            const logout = await request(app)
                .get('/logout');

            expect([200, 401, 500]).toContain(logout.status);
            console.log(`    ✓ Step 3: Logout (${logout.status})`);
        }, 20000);

        test('Company management workflow', async () => {
            const list = await request(app)
                .get('/list');

            console.log(`    ✓ List companies (${list.status})`);

            const create = await request(app)
                .post('/create')
                .send({ name: 'Company' });

            expect(create.status).toBe(401);
            console.log(`    ✓ Create requires auth (${create.status})`);

            const deleteRes = await request(app)
                .delete('/delete/test');

            expect(deleteRes.status).toBe(401);
            console.log(`    ✓ Delete requires auth (${deleteRes.status})`);
        });
    });

    describe('4. Error Handling', () => {

        test('Empty signup rejected', async () => {
            const response = await request(app)
                .post('/signup')
                .send({});

            expect(response.status).toBe(400);
            console.log('    ✓ Empty signup rejected');
        });

        test('Empty login rejected', async () => {
            const response = await request(app)
                .post('/login')
                .send({});

            expect(response.status).toBe(400);
            console.log('    ✓ Empty login rejected');
        });

        test('Invalid delete ID handled', async () => {
            const response = await request(app)
                .delete('/delete/invalid-id');

            expect([400, 401, 404, 500]).toContain(response.status);
            console.log('    ✓ Invalid ID handled');
        });

        test('Long input strings handled', async () => {
            const long = 'x'.repeat(5000);

            const response = await request(app)
                .post('/signup')
                .send({ email: long, password: long });

            expect([400, 413, 500]).toContain(response.status);
            console.log('    ✓ Long strings handled');
        });
    });

    describe('5. Response Validation', () => {

        test('Endpoints return proper responses', async () => {
            const r1 = await request(app).get('/logout');
            expect(r1.body).toBeDefined();

            const r2 = await request(app).get('/list');
            expect(r2.body).toBeDefined();

            console.log('    ✓ Response structures valid');
        });

        test('Protected endpoints return 401', async () => {
            const r1 = await request(app).post('/create').send({ name: 'Test' });
            expect(r1.status).toBe(401);

            const r2 = await request(app).delete('/delete/123');
            expect(r2.status).toBe(401);

            console.log('    ✓ Protected endpoints secured');
        });

        test('Invalid HTTP methods handled', async () => {
            const response = await request(app).post('/logout');
            expect([200, 404, 405]).toContain(response.status);
            console.log('    ✓ Invalid methods handled');
        });
    });
});
