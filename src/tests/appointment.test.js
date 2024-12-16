const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Appointment = require('../models/appointment');

describe('Appointment Flow', () => {
    let studentA1Token, studentA2Token, professorP1Token;
    let professorP1Id, appointmentId, appointmentIdT2;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI);
        await User.deleteMany({});
        await Appointment.deleteMany({});
    });

    const steps = [
        {
            name:'1. Student A1 Authentication',
            async action() {
                const response=await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: 'Student A1',
                        email: 'studentA1@test.com',
                        password: 'password123',
                        role: 'student'
                    });
                expect(response.status).toBe(201);
                studentA1Token = response.body.token;
            }
        },
        {
            name:'2. Professor P1 Authentication',
            async action() {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: 'Professor P1',
                        email: 'professorP1@test.com',
                        password: 'password123',
                        role: 'professor'
                    });
                expect(response.status).toBe(201);
                professorP1Token = response.body.token;
                professorP1Id = response.body.userId;
            }
        },
        {
            name:'3. Professor P1 Specifies Available Time Slots',
            async action() {
                // For Creating first time slot (T1)
                const responseT1=await request(app)
                    .post('/api/professor/availability')
                    .set('Authorization', `Bearer ${professorP1Token}`)
                    .send({
                        startTime: new Date(Date.now() + 3600000).toISOString(), // T1: 1 hour from now
                        endTime: new Date(Date.now() + 7200000).toISOString()   // T1: 2 hours from now
                    });
                
                console.log('Created appointment T1:', responseT1.body);
                expect(responseT1.status).toBe(201);
                appointmentId = responseT1.body._id;

                // time slot (T2)
                const responseT2 = await request(app)
                    .post('/api/professor/availability')
                    .set('Authorization', `Bearer ${professorP1Token}`)
                    .send({
                        startTime: new Date(Date.now() + 10800000).toISOString(),
                        endTime: new Date(Date.now() + 14400000).toISOString()
                    });
                
                console.log('Created appointment T2:', responseT2.body);
                expect(responseT2.status).toBe(201);
                appointmentIdT2 = responseT2.body._id;

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        },
        {
            name:'4. Student A1 Views Available Time Slots',
            async action() {
                const response=await request(app)
                    .get(`/api/student/appointments/available?professorId=${professorP1Id}`)
                    .set('Authorization', `Bearer ${studentA1Token}`);
                
                console.log('Available appointments response:', response.body);
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(2);
            }
        },
        {
            name:'5. Student A1 Books Appointment for T1',
            async action() {
                const response=await request(app)
                    .post(`/api/student/appointments/${appointmentId}/book`)
                    .set('Authorization', `Bearer ${studentA1Token}`);
                expect(response.status).toBe(200);
            }
        },
        {
            name: '6. Student A2 Authentication',
            async action() {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: 'Student A2',
                        email: 'studentA2@test.com',
                        password: 'password123',
                        role: 'student'
                    });
                expect(response.status).toBe(201);
                studentA2Token=response.body.token;
            }
        },
        {
            name: '7. Student A2 Books Appointment for T2',
            async action() {
                const response = await request(app)
                    .post(`/api/student/appointments/${appointmentIdT2}/book`)
                    .set('Authorization', `Bearer ${studentA2Token}`);
                expect(response.status).toBe(200);
            }
        },
        {
            name: '8. Professor P1 Cancels Appointment with Student A1',
            async action() {
                const response = await request(app)
                    .put(`/api/professor/appointments/${appointmentId}/cancel`)
                    .set('Authorization', `Bearer ${professorP1Token}`);
                expect(response.status).toBe(200);
            }
        },
        {
            name:'9. Student A1 Verifies No Pending Appointments',
            async action() {
                const response = await request(app)
                    .get('/api/student/appointments/my')
                    .set('Authorization', `Bearer ${studentA1Token}`);
                expect(response.status).toBe(200);
                expect(response.body.length).toBe(0);
            }
        }
    ];

    test.each(steps)('$name', async ({ name, action }) => {
        console.log(`\n📝 Testing:${name}`);
        try {
            await action();
            console.log(`✅ Passed:${name}`);
        }
        catch (error) {
            console.error(`❌ Failed:${name}`, error);
            throw error;
        }
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });
});

