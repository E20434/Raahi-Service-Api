import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AmbassadorModule } from '../src/modules/ambassador/ambassador.module';
import { AmbassadorEntity } from '../src/modules/ambassador/entities/ambassador.entity';
import { VendorEntity } from '../src/modules/vendor/entities/vendor.entity';
import {
  buildAmbassadorFixture,
  SEED_AMB_ACTIVE_REF_CODE,
  SEED_AMB_ACTIVE_EMAIL,
  SEED_AMB_INACTIVE_REF_CODE,
} from './fixtures/ambassador/ambassador.fixture';

jest.setTimeout(180_000);

describe('Ambassador (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let ambassadorRepository: Repository<AmbassadorEntity>;
  let vendorRepository: Repository<VendorEntity>;

  async function seedAmbassadors(now: Date) {
    await ambassadorRepository.insert(buildAmbassadorFixture(now));
  }

  async function resetFixtures() {
    await vendorRepository.clear();
    await ambassadorRepository.clear();
    await seedAmbassadors(new Date());
  }

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          ssl: false,
          synchronize: true,
          dropSchema: true,
          logging: false,
          entities: [AmbassadorEntity, VendorEntity],
        }),
        AmbassadorModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    ambassadorRepository = dataSource.getRepository(AmbassadorEntity);
    vendorRepository = dataSource.getRepository(VendorEntity);
  }, 180_000);

  beforeEach(async () => {
    await resetFixtures();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (container) await container.stop();
  });

  // ---------------------------------------------------------------------------
  // POST /api/v1/ambassador
  // ---------------------------------------------------------------------------

  describe('POST /api/v1/ambassador', () => {
    it('creates a new ambassador and returns the response DTO', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador')
        .send({
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+9999999999',
          payout_details: 'PayPal: john@example.com',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+9999999999',
        payout_details: 'PayPal: john@example.com',
        is_active: true,
      });
      expect(response.body.amb_id).toBeDefined();
      expect(response.body.ref_code).toMatch(/^[A-Z]{3}\d{3}$/);
      expect(response.body.created_at).toBeDefined();
    });

    it('creates a new ambassador without optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador')
        .send({ full_name: 'Jane Doe', email: 'jane@example.com' })
        .expect(201);

      expect(response.body).toMatchObject({
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        is_active: true,
      });
    });

    it('returns 409 when email is already registered', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador')
        .send({ full_name: 'Alice Clone', email: SEED_AMB_ACTIVE_EMAIL })
        .expect(409);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'conflict',
          message: 'Ambassador already exists',
        },
      });
      expect(response.body.error_details.request_id).toBeDefined();
    });

    it('returns 400 when full_name is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ambassador')
        .send({ email: 'new@example.com' })
        .expect(400);
    });

    it('returns 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ambassador')
        .send({ full_name: 'Test User', email: 'not-an-email' })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/v1/ambassador/vendor/register
  // ---------------------------------------------------------------------------

  describe('POST /api/v1/ambassador/vendor/register', () => {
    it('registers a vendor via valid ref_code and returns the response DTO', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_ACTIVE_REF_CODE,
          business_name: 'Sunrise Tours',
          email: 'vendor@example.com',
          phone: '+1112223333',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        email: 'vendor@example.com',
        business_name: 'Sunrise Tours',
        ref_code_used: SEED_AMB_ACTIVE_REF_CODE,
        onboarding_status: 'PENDING',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.created_at).toBeDefined();
    });

    it('returns 404 when ref_code does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: 'ZZZ999',
          business_name: 'Ghost Tours',
          email: 'ghost@example.com',
          phone: '+0000000000',
        })
        .expect(404);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'resource_not_found',
          message: 'Referral code not found',
        },
      });
      expect(response.body.error_details.request_id).toBeDefined();
    });

    it('returns 400 when the ambassador is inactive', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_INACTIVE_REF_CODE,
          business_name: 'Inactive Tours',
          email: 'inactive@example.com',
          phone: '+1231231234',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'bad_request',
          message: 'Referral code is inactive',
        },
      });
    });

    it('returns 409 when vendor email is already registered', async () => {
      // Register a vendor once
      await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_ACTIVE_REF_CODE,
          business_name: 'First Tours',
          email: 'taken@example.com',
          phone: '+1112223333',
        })
        .expect(201);

      // Try to register again with the same email
      const response = await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_ACTIVE_REF_CODE,
          business_name: 'Second Tours',
          email: 'taken@example.com',
          phone: '+4445556666',
        })
        .expect(409);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'conflict',
          message: 'Vendor with this email already exists',
        },
      });
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({ ref_code: SEED_AMB_ACTIVE_REF_CODE })
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/v1/ambassador/referrals
  // ---------------------------------------------------------------------------

  describe('GET /api/v1/ambassador/referrals', () => {
    it('returns referrals dashboard with registered vendors', async () => {
      // Seed two vendors under the active ambassador
      await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_ACTIVE_REF_CODE,
          business_name: 'Ocean Tours',
          email: 'ocean@example.com',
          phone: '+1110001111',
        });
      await request(app.getHttpServer())
        .post('/api/v1/ambassador/vendor/register')
        .send({
          ref_code: SEED_AMB_ACTIVE_REF_CODE,
          business_name: 'Mountain Treks',
          email: 'mountain@example.com',
          phone: '+2220002222',
        });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ambassador/referrals?ref_code=${SEED_AMB_ACTIVE_REF_CODE}`)
        .expect(200);

      expect(response.body).toMatchObject({
        ref_code: SEED_AMB_ACTIVE_REF_CODE,
        total: 2,
      });
      expect(response.body.vendors).toHaveLength(2);
      expect(response.body.vendors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ business_name: 'Ocean Tours', status: 'PENDING' }),
          expect.objectContaining({ business_name: 'Mountain Treks', status: 'PENDING' }),
        ]),
      );
    });

    it('returns an empty vendor list when no vendors have registered', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ambassador/referrals?ref_code=${SEED_AMB_ACTIVE_REF_CODE}`)
        .expect(200);

      expect(response.body).toEqual({
        ref_code: SEED_AMB_ACTIVE_REF_CODE,
        total: 0,
        vendors: [],
      });
    });

    it('returns 404 when ref_code does not belong to any ambassador', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/ambassador/referrals?ref_code=ZZZ999')
        .expect(404);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'resource_not_found',
          message: 'Ambassador not found',
        },
      });
      expect(response.body.error_details.request_id).toBeDefined();
    });

    it('returns 400 when ref_code query param is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/ambassador/referrals')
        .expect(400);

      expect(response.body).toMatchObject({
        status: 'error',
        error_details: {
          error_code: 'bad_request',
          message: 'ref_code query parameter is required',
        },
      });
    });
  });
});
