const app = require('./app.js');
const request = require('supertest');

describe('express-mute middleware: mute', () => {

    it('should mute matching POST request', async () => {
        await request(app)
            .post('/api/login')
            .set('x-api-key', 'test-key')
            .expect(403)
            .expect({ error: 'Muted login' });
    });

    it('should mute matching GET request with no response body', async () => {
        await request(app)
            .get('/api/health')
            .expect(204);
    });

    it('should mute GET request with matching literal query param', async () => {
        await request(app)
            .get('/api/literal-match')
            .query({ env: 'staging' })
            .expect(400)
            .expect({ error: 'No longer supported' });
    });

    it('should mute GET request with regex-matching query param', async () => {
        await request(app)
            .get('/api/regex-match')
            .query({ id: 'test-123' })
            .expect(410)
            .expect({ error: 'Deprecated ID' });
    });

    it('should mute POST request with regex-matching body param', async () => {
        await request(app)
            .post('/api/user')
            .send({ device: 'android-13' })
            .expect(403)
            .expect({ error: 'Android clients blocked' });
    });

    it('should mute GET request with regex-matching url and header', async () => {
        await request(app)
            .get('/api/user/5678')
            .set('x-client', 'v1.2.3')
            .expect(410)
            .expect({ error: 'Client too old' });
    });
});
