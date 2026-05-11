import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ServiceModule } from '../src/modules/service/service.module';
import {
  Category,
  Location,
  LocationService,
  Service as ServiceEntity,
} from '../src/modules/service/entities';

jest.setTimeout(180_000);

describe('Services By Location Smoke (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let locationRepository: Repository<Location>;

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
          entities: [Location, Category, ServiceEntity, LocationService],
        }),
        ServiceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    locationRepository = dataSource.getRepository(Location);

    const now = new Date();
    await locationRepository.insert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Sri Lanka',
      type: 'COUNTRY',
      parentId: null as unknown as string,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }, 180_000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (container) {
      await container.stop();
    }
  });

  it('should seed Sri Lanka location into the test database', async () => {
    const location = await locationRepository.findOne({
      where: { id: '00000000-0000-0000-0000-000000000001' },
    });

    expect(location).toBeDefined();
    expect(location?.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(location?.name).toBe('Sri Lanka');
    expect(location?.type).toBe('COUNTRY');
  });
});
