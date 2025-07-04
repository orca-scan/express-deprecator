const app = require('./app.js');
const request = require('supertest');

describe('allow requests', () => {

    it('should allow when rule expects body but request has none', async () => {
        await request(app)
            .post('/')
            .expect(200)
            .expect({ ok: true });
    });

    it('should allow POST request with unmatched header', async () => {
        await request(app)
            .post('/')
            .set('x-api-key', 'prod-key') // doesn't match rule for 'test-key'
            .expect(200)
            .expect({ ok: true });
    });

    it('should allow GET request with unmatched query param', async () => {
        await request(app)
            .get('/')
            .query({ env: 'production' }) // doesn't match 'staging'
            .expect(200)
            .expect({ ok: true });
    });

    it('should allow POST request with unmatched body param', async () => {
        await request(app)
            .post('/')
            .send({ device: 'ios-17' }) // doesn't match /^android-/
            .expect(200)
            .expect({ ok: true });
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

    it('should allow GET / when nested JSON in query does not match', async () => {
        await request(app)
            .get('/')
            .query({
                payload: JSON.stringify({ env: 'staging' })
            })
            .expect(200)
            .expect({ ok: true });
    });

    it('should allow if no items match all required fields', async () => {
        await request(app)
            .post('/')
            .send([
                { lib: { name: 'simplitics-client' } },
                { lib: { version: '0.0.0' } }
            ])
            .expect(200)
            .expect({ ok: true });
    });
});
