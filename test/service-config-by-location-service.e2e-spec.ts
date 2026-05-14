import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SchemaModule } from '../src/modules/schema/schema.module';
import {
  AssetType,
  SchemaStatus,
  ServiceOnboardingSchema,
  ServiceSpecialField,
} from '../src/modules/schema/entities';
import {
  Category,
  Location,
  LocationService,
  Service as ServiceEntity,
} from '../src/modules/service/entities';
import { buildCategoriesFixture } from './fixtures/service-config-by-location-service/categories.fixture';
import { buildLocationsFixture } from './fixtures/service-config-by-location-service/locations.fixture';
import { buildServicesFixture } from './fixtures/service-config-by-location-service/services.fixture';
import { buildLocationServicesFixture } from './fixtures/service-config-by-location-service/location-services.fixture';
import { buildServiceSchemasFixture } from './fixtures/service-config-by-location-service/service-schemas.fixture';
import { buildSpecialFieldsFixture } from './fixtures/service-config-by-location-service/special-fields.fixture';
import { buildAssetTypesFixture } from './fixtures/service-config-by-location-service/asset-types.fixture';

jest.setTimeout(180_000);

describe('Service Config By Location Service (e2e)', () => {
  const SCHEMA_ID = '11111111-1111-1111-1111-111111111111';
  const OTHER_SCHEMA_ID = '33333333-3333-3333-3333-333333333333';
  const endpoint =
    '/api/service-config/by-location-service/city_intercity_rides_LK';

  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let locationRepository: Repository<Location>;
  let serviceRepository: Repository<ServiceEntity>;
  let locationServiceRepository: Repository<LocationService>;
  let schemaRepository: Repository<ServiceOnboardingSchema>;
  let specialFieldRepository: Repository<ServiceSpecialField>;
  let assetTypeRepository: Repository<AssetType>;

  async function seedCategories(now: Date) {
    await categoryRepository.insert(buildCategoriesFixture(now));
  }

  async function seedServices(now: Date) {
    await serviceRepository.insert(buildServicesFixture(now));
  }

  async function seedLocations(now: Date) {
    await locationRepository.insert(buildLocationsFixture(now));
  }

  async function seedLocationServices(now: Date, schemaId: string) {
    await locationServiceRepository.insert(
      buildLocationServicesFixture(now, schemaId),
    );
  }

  async function seedSchemas(schemaId: string) {
    await schemaRepository.insert(buildServiceSchemasFixture(schemaId));
  }

  async function seedSpecialFields(schemaId: string) {
    await specialFieldRepository.insert(buildSpecialFieldsFixture(schemaId));
  }

  async function seedAssetTypes(schemaId: string) {
    await assetTypeRepository.insert(buildAssetTypesFixture(schemaId));
  }

  async function seedPublishedCityIntercityRidesConfigFixture() {
    const now = new Date();
    await seedCategories(now);
    await seedLocations(now);
    await seedServices(now);
    await seedSchemas(SCHEMA_ID);
    await seedLocationServices(now, SCHEMA_ID);
    await seedSpecialFields(SCHEMA_ID);
    await seedAssetTypes(SCHEMA_ID);
  }

  async function deleteAllSeedData() {
    await assetTypeRepository.createQueryBuilder().delete().execute();
    await specialFieldRepository.createQueryBuilder().delete().execute();
    await locationServiceRepository.createQueryBuilder().delete().execute();
    await schemaRepository.createQueryBuilder().delete().execute();
    await serviceRepository.createQueryBuilder().delete().execute();
    await locationRepository.createQueryBuilder().delete().execute();
    await categoryRepository.createQueryBuilder().delete().execute();
  }

  async function resetPublishedCityIntercityRidesConfigFixture() {
    await deleteAllSeedData();
    await seedPublishedCityIntercityRidesConfigFixture();
  }

  async function expectResourceNotFound(path: string, message: string) {
    const response = await request(app.getHttpServer()).get(path).expect(404);

    expect(response.body).toMatchObject({
      status: 'error',
      error_details: {
        error_code: 'resource_not_found',
        message,
      },
    });
    expect(response.body.error_details.request_id).toBeDefined();
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
          entities: [
            Category,
            Location,
            ServiceEntity,
            LocationService,
            ServiceOnboardingSchema,
            ServiceSpecialField,
            AssetType,
          ],
        }),
        SchemaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    categoryRepository = dataSource.getRepository(Category);
    locationRepository = dataSource.getRepository(Location);
    serviceRepository = dataSource.getRepository(ServiceEntity);
    locationServiceRepository = dataSource.getRepository(LocationService);
    schemaRepository = dataSource.getRepository(ServiceOnboardingSchema);
    specialFieldRepository = dataSource.getRepository(ServiceSpecialField);
    assetTypeRepository = dataSource.getRepository(AssetType);
  }, 180_000);

  beforeEach(async () => {
    await resetPublishedCityIntercityRidesConfigFixture();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (container) {
      await container.stop();
    }
  });

  it('should return the published service config for the location service key', async () => {
    const response = await request(app.getHttpServer()).get(endpoint).expect(200);

    expect(response.body).toEqual({
      meta: {
        service_type: 'City Rides, Intercity Rides',
        schema_version: '1.0',
        rules: {
          max_assets_allowed: 1,
        },
      },
      special_elements: [
        {
          entity_type: 'HUMAN',
          entity_id: 'human_vendor',
          title: 'Driver Profile',
          description: 'Required credentials for the individual driver.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'Driver License Number',
              field_id: 'driver_license_number',
              validation: {
                required: true,
              },
              placeholder: 'Enter your local driving license number',
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Years of Driving Experience',
              field_id: 'years_of_driving_experience',
              validation: {
                min: 1,
                required: true,
              },
            },
          ],
        },
      ],
      asset_types: [
        {
          asset_type_id: 'CAR',
          label: 'Car',
          description:
            'Standard car used for city or intercity rides in Sri Lanka.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'License Plate',
              field_id: 'license_plate',
              validation: {
                required: true,
              },
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Vehicle Year',
              field_id: 'vehicle_year',
              validation: {
                min: 2010,
                required: true,
              },
            },
          ],
        },
      ],
    });
  });

  it('should return 404 for an unknown location service key', async () => {
    await expectResourceNotFound(
      '/api/service-config/by-location-service/NOT-EXIST',
      "LocationService with key 'NOT-EXIST' not found",
    );
  });

  it('should return 404 for an inactive location service', async () => {
    await locationServiceRepository.update(
      { service_location_key: 'city_intercity_rides_LK' },
      { isActive: false },
    );

    await expectResourceNotFound(
      endpoint,
      "LocationService with key 'city_intercity_rides_LK' not found",
    );
  });

  it('should return 404 when no onboarding schema is assigned', async () => {
    await locationServiceRepository.update(
      { service_location_key: 'city_intercity_rides_LK' },
      { onboardingSchemaId: null as unknown as string },
    );

    await expectResourceNotFound(
      endpoint,
      'No onboarding schema assigned to this location service',
    );
  });

  it('should return 404 for an inactive schema', async () => {
    await schemaRepository.update({ id: SCHEMA_ID }, { isActive: false });

    await expectResourceNotFound(
      endpoint,
      "Schema not found for location service key 'city_intercity_rides_LK'",
    );
  });

  it('should return 404 when the schema is not published', async () => {
    await schemaRepository.update(
      { id: SCHEMA_ID },
      { status: SchemaStatus.DRAFT },
    );

    await expectResourceNotFound(
      endpoint,
      "Published schema not found for location service key 'city_intercity_rides_LK'",
    );
  });

  it('should return 404 when the schema belongs to a different service key', async () => {
    const now = new Date();

    await serviceRepository.insert([
      {
        service_key: 'FISHING_TRIPS',
        category_key: 'DRIVERS_AND_CHAUFFEURS',
        name: 'Fishing Trips',
        description: 'Alternate service used for mismatch testing.',
        displayOrder: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await schemaRepository.update(
      { id: SCHEMA_ID },
      { serviceKey: 'FISHING_TRIPS' },
    );

    await expectResourceNotFound(
      endpoint,
      "Schema not found for location service key 'city_intercity_rides_LK'",
    );
  });

  it('should return 404 for an inactive backing service', async () => {
    await serviceRepository.update(
      { service_key: 'CITY_INTERCITY_RIDES' },
      { isActive: false },
    );

    await expectResourceNotFound(endpoint, 'Service not found for schema');
  });

  it('should return only child rows for the linked schema id', async () => {
    const now = new Date();

    await schemaRepository.insert([
      {
        id: OTHER_SCHEMA_ID,
        serviceKey: 'CITY_INTERCITY_RIDES',
        schemaKey: 'CITY_INTERCITY_RIDES_ALT',
        maxAssetsAllowed: 9,
        schemaVersion: '9.9',
        status: SchemaStatus.PUBLISHED,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await specialFieldRepository.insert([
      {
        schemaId: OTHER_SCHEMA_ID,
        entityType: 'DOCUMENT',
        entityId: 'other_schema_only',
        title: 'Other Schema Field',
        description: 'Should not appear in the response for the linked schema.',
        fieldsJson: [
          {
            type: 'TEXT_INPUT',
            label: 'Other Schema Input',
            field_id: 'other_schema_input',
            validation: {
              required: true,
            },
          },
        ],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await assetTypeRepository.insert([
      {
        schemaId: OTHER_SCHEMA_ID,
        assetTypeId: 'MOTORBIKE',
        label: 'Motorbike',
        description: 'Should not appear in the response for the linked schema.',
        assetFieldsJson: [
          {
            type: 'TEXT_INPUT',
            label: 'Registration Number',
            field_id: 'registration_number',
            validation: {
              required: true,
            },
          },
        ],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const response = await request(app.getHttpServer()).get(endpoint).expect(200);

    expect(response.body).toEqual({
      meta: {
        service_type: 'City Rides, Intercity Rides',
        schema_version: '1.0',
        rules: {
          max_assets_allowed: 1,
        },
      },
      special_elements: [
        {
          entity_type: 'HUMAN',
          entity_id: 'human_vendor',
          title: 'Driver Profile',
          description: 'Required credentials for the individual driver.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'Driver License Number',
              field_id: 'driver_license_number',
              validation: {
                required: true,
              },
              placeholder: 'Enter your local driving license number',
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Years of Driving Experience',
              field_id: 'years_of_driving_experience',
              validation: {
                min: 1,
                required: true,
              },
            },
          ],
        },
      ],
      asset_types: [
        {
          asset_type_id: 'CAR',
          label: 'Car',
          description:
            'Standard car used for city or intercity rides in Sri Lanka.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'License Plate',
              field_id: 'license_plate',
              validation: {
                required: true,
              },
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Vehicle Year',
              field_id: 'vehicle_year',
              validation: {
                min: 2010,
                required: true,
              },
            },
          ],
        },
      ],
    });
  });

  it('should not return inactive special fields', async () => {
    await specialFieldRepository.update(
      { entityId: 'human_vendor' },
      { isActive: false },
    );

    const response = await request(app.getHttpServer()).get(endpoint).expect(200);

    expect(response.body).toEqual({
      meta: {
        service_type: 'City Rides, Intercity Rides',
        schema_version: '1.0',
        rules: {
          max_assets_allowed: 1,
        },
      },
      special_elements: [],
      asset_types: [
        {
          asset_type_id: 'CAR',
          label: 'Car',
          description:
            'Standard car used for city or intercity rides in Sri Lanka.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'License Plate',
              field_id: 'license_plate',
              validation: {
                required: true,
              },
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Vehicle Year',
              field_id: 'vehicle_year',
              validation: {
                min: 2010,
                required: true,
              },
            },
          ],
        },
      ],
    });
  });

  it('should not return inactive asset types', async () => {
    await assetTypeRepository.update(
      { assetTypeId: 'CAR' },
      { isActive: false },
    );

    const response = await request(app.getHttpServer()).get(endpoint).expect(200);

    expect(response.body).toEqual({
      meta: {
        service_type: 'City Rides, Intercity Rides',
        schema_version: '1.0',
        rules: {
          max_assets_allowed: 1,
        },
      },
      special_elements: [
        {
          entity_type: 'HUMAN',
          entity_id: 'human_vendor',
          title: 'Driver Profile',
          description: 'Required credentials for the individual driver.',
          fields: [
            {
              type: 'TEXT_INPUT',
              label: 'Driver License Number',
              field_id: 'driver_license_number',
              validation: {
                required: true,
              },
              placeholder: 'Enter your local driving license number',
            },
            {
              type: 'NUMBER_INPUT',
              label: 'Years of Driving Experience',
              field_id: 'years_of_driving_experience',
              validation: {
                min: 1,
                required: true,
              },
            },
          ],
        },
      ],
      asset_types: [],
    });
  });

  it('should return empty arrays when the schema has no special fields or asset types', async () => {
    await assetTypeRepository.createQueryBuilder().delete().execute();
    await specialFieldRepository.createQueryBuilder().delete().execute();

    const response = await request(app.getHttpServer()).get(endpoint).expect(200);

    expect(response.body).toEqual({
      meta: {
        service_type: 'City Rides, Intercity Rides',
        schema_version: '1.0',
        rules: {
          max_assets_allowed: 1,
        },
      },
      special_elements: [],
      asset_types: [],
    });
  });
});
