const request = require('supertest');
const app = require('./app'); 

describe('API Health Check', () => {
    test('GET / returns status code 200', async () => {
        // Hitting the base route which doesn't need a database connection
        const res = await request(app).get('/'); 
        
        expect(res.statusCode).toBe(200);
    });
});

// const request = require('supertest');
// const app = require('./app'); 

// describe('API Health Check', () => {
//     test('GET / returns status code 200', async () => {
//         // Hitting the base route which doesn't need a database connection
//         const res = await request(app).get('/'); 
        
//         expect(res.statusCode).toBe(200);
//     });
// });