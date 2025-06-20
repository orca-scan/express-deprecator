const app = require('./app.js');
const request = require('supertest');

describe('express-mute middleware: allow', () => {

    it('should allow unmatched POST request', async () => {
        await request(app)
            .post('/api/login')
            .set('x-api-key', 'prod-key')
            .expect(200)
            .expect({ ok: true });
    });

    it('should allow GET request that does not match any rule', async () => {
        await request(app)
            .get('/api/unknown')
            .expect(404); // no route defined
    });

    it('should allow POST request with unmatched body param', async () => {
        await request(app)
            .post('/api/user')
            .send({ device: 'ios-17' })
            .expect(404); // no route defined
    });
});
