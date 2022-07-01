const request = require('supertest');

const app = require('../../src/app');
const truncate = require('../utils/truncate');
const factory = require('../factories');

// Grupo de teste de autenticação
describe('Authentication', () => {
  // antes de casa teste, executara o truncate
  beforeEach(async () => { await truncate() });

  // teste para autenticar credenciais validas
  it('should authenticate with valid credentials', async () => {
    // cria usuario aleatorio
    const user = await factory.create('User', {
      password: '123123'
    });

    // Realiza um post em sessions, passando email e password e aguardando a resposta
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123123'
      });

    // Espera receber 200 no response.status
    expect(response.status).toBe(200);
  });

  // teste para nao autenticar com credenciais invalidas
  it('should not authenticate with invalid credencials', async () => {

    const user = await factory.create('User', {
      password: '123123'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123456'
      });

    expect(response.status).toBe(401);

  });

  // teste para retornar um token quando autenticado
  it('should return jwt token when authenticated', async () => {
    const user = await factory.create('User', {
      password: '123123'
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '123123'
      });

    expect(response.body).toHaveProperty('token');
  });

  // teste para nao ser acessivel acessar rotas privadas quando autenticado
  it('should not be able to acess private routes when authenticated', async () => {
    const user = await factory.create('User', {
      password: '123123'
    });

    const response = await request(app)
      .get('/deshboard')
      .send({
        email: user.email,
        password: '123123'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Token not provided");
  });
// teste para acessar rotas privadas quando autenticado
  it('Should be able to acess private routes when authenticated', async () => {

    const user = await factory.create('User', {
      password: "123123"
    });

    const response = await request(app)
      .get('/dashboard')
      .set('Autorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(401);

  });
// teste para nao ser possivel acessar rotas privadas sem jwt token
  it('should not be able to access private routes without jwt token', async () =>{
     const response = await request(app).get('/dashboard');
      
     expect(response.status).toBe(401);
  });
// teste para nao ser possivel acessar rotas privadas com jwt token invalido
  it('should not be able to acess private routes with invalid jwt token', async () =>{
    const response = await request(app)
      .get('/dashboard')
      .set('Autorization', `Bearer 123123`);

    expect(response.status).toBe(401);
  }); 
});