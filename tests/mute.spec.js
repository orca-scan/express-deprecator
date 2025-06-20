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

    it('should not crash when req.body is not an object', async () => {
        await request(app)
            .get('/test')
            .set('Content-Type', 'text/plain')
            .send('non-json-body')
            .expect(410);
    });

    it('should mute request when nested body fields match', async () => {
        await request(app)
            .post('/')
            .send({
                lib: {
                    name: 'simplitics-client',
                    version: '0.0.0'
                }
            })
            .expect(426)
            .expect({
                error: 'This API version is no longer supported',
                upgrade: 'https://api.example.com/docs/v2'
            });
    });

    it('should allow request when nested values do not match', async () => {
        await request(app)
            .post('/')
            .send({
                lib: {
                    name: 'simplitics-client',
                    version: '3.2.1'
                }
            })
            .expect(200)
            .expect({ ok: true });
    });

    it('should mute a single object body with matching nested values', async () => {
        await request(app)
            .post('/')
            .send({
                lib: { name: 'simplitics-client', version: '0.0.0' }
            })
            .expect(426)
            .expect({
                error: 'This API version is no longer supported',
                upgrade: 'https://api.example.com/docs/v2'
            });
    });

    it('should mute if one of the array items matches', async () => {
        await request(app)
            .post('/')
            .send([
                { lib: { name: 'not-matching' } },
                { lib: { name: 'simplitics-client', version: '0.0.0' } }
            ])
            .expect(426)
            .expect({
                error: 'This API version is no longer supported',
                upgrade: 'https://api.example.com/docs/v2'
            });
    });

    it('should not mute if none of the array items match', async () => {
        await request(app)
            .post('/')
            .send([
                { lib: { name: 'invalid', version: '1.2.3' } },
                { lib: { name: 'other' } }
            ])
            .expect(200)
            .expect({ ok: true });
    });
});
