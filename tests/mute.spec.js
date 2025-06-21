const app = require('./app.js');
const request = require('supertest');

describe('mute requests', () => {

    it('should mute matching POST request', async () => {
        await request(app)
            .post('/')
            .set('x-api-key', 'test-key')
            .expect(403)
            .expect({ error: 'Muted login' });
    });

    it('should mute GET request with matching literal query param', async () => {
        await request(app)
            .get('/')
            .query({ env: 'staging' })
            .expect(400)
            .expect({ error: 'No longer supported' });
    });

    it('should mute GET request with regex-matching query param', async () => {
        await request(app)
            .get('/')
            .query({ id: 'test-123' })
            .expect(410)
            .expect({ error: 'Deprecated ID' });
    });

    it('should mute POST request with regex-matching body param', async () => {
        await request(app)
            .post('/')
            .send({ device: 'android-13' })
            .expect(403)
            .expect({ error: 'Android clients blocked' });
    });

    it('should mute GET request with regex-matching header', async () => {
        await request(app)
            .get('/')
            .set('x-client', 'v1.2.3')
            .expect(410)
            .expect({ error: 'Client too old' });
    });

    it('should not mute when rule expects body but request has none', async () => {
        await request(app)
            .post('/')
            .expect(200)
            .expect({ ok: true });
    });

    it('should not crash when req.body is not an object', async () => {
        await request(app)
            .post('/')
            .set('Content-Type', 'text/plain')
            .send('non-json-body')
            .expect(200)
            .expect({ ok: true });
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

    it('should mute when single object body matches all fields', async () => {
        await request(app)
            .post('/')
            .send({
                lib: { name: 'simplitics-client', version: '0.0.0' }
            })
            .expect(426);
    });

    it('should mute when one item in array body matches all fields', async () => {
        await request(app)
            .post('/')
            .send([
                { lib: { name: 'other-client', version: '1.0.0' } },
                { lib: { name: 'simplitics-client', version: '0.0.0' } }
            ])
            .expect(426);
    });

    it('should not mute if no items match all required fields', async () => {
        await request(app)
            .post('/')
            .send([
                { lib: { name: 'simplitics-client' } },
                { lib: { version: '0.0.0' } }
            ])
            .expect(200)
            .expect({ ok: true });
    });

    it('should mute GET / when nested JSON in query matches rule', async () => {
        await request(app)
            .get('/')
            .query({
                data: {
                    lib: {
                        name: 'simplitics-client',
                        version: '0.0.0'
                    }
                }
            })
            .expect(426)
            .expect({
                error: 'This API version is no longer supported',
                upgrade: 'https://api.example.com/docs/v2'
            });
    });
});
