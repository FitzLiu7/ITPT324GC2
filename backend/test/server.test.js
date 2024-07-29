import chai from 'chai';
import chaiHttp from 'chai-http';
import server from 'C:\Users\brodi\insect-production-management\ITPT324GC2\backend\server.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /api/data', () => {
  it('should return a 200 status and a message', (done) => {
    chai.request(server)
      .get('/api/data')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('Backend server is running');
        done();
      });
  });
});
