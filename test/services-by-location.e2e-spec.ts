import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ServiceModule } from '../src/modules/service/service.module';
import {
  Category,
  Location,
  LocationService,
  Service as ServiceEntity,
} from '../src/modules/service/entities';
import { buildLocationsFixture } from './fixtures/services-by-location/locations.fixture';
import { buildCategoriesFixture } from './fixtures/services-by-location/categories.fixture';
import { buildServicesFixture } from './fixtures/services-by-location/services.fixture';
import { buildLocationServicesFixture } from './fixtures/services-by-location/location-services.fixture';

jest.setTimeout(180_000);

describe('Services By Location (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let locationRepository: Repository<Location>;
  let categoryRepository: Repository<Category>;
  let serviceRepository: Repository<ServiceEntity>;
  let locationServiceRepository: Repository<LocationService>;

  async function seedLocations(now: Date) {
    await locationRepository.insert(buildLocationsFixture(now));
  }

  async function seedCategories(now: Date) {
    await categoryRepository.insert(buildCategoriesFixture(now));
  }

  async function seedServices(now: Date) {
    await serviceRepository.insert(buildServicesFixture(now));
  }

  async function seedLocationServices(now: Date) {
    await locationServiceRepository.insert(buildLocationServicesFixture(now));
  }

  async function seedSriLankaApi1Fixture() {
    const now = new Date();
    await seedLocations(now);
    await seedCategories(now);
    await seedServices(now);
    await seedLocationServices(now);
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
          entities: [Location, Category, ServiceEntity, LocationService],
        }),
        ServiceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    locationRepository = dataSource.getRepository(Location);
    categoryRepository = dataSource.getRepository(Category);
    serviceRepository = dataSource.getRepository(ServiceEntity);
    locationServiceRepository = dataSource.getRepository(LocationService);

    await seedSriLankaApi1Fixture();
  }, 180_000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (container) {
      await container.stop();
    }
  });

  it('should return the expected service listing for Sri Lanka', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/services/by-location/LK')
      .expect(200);

    expect(response.body).toEqual({
      selected_location: {
        location_code: 'LK',
        name: 'Sri Lanka',
        type: 'COUNTRY',
      },
      categories: [
        {
          category_key: 'DRIVERS_AND_CHAUFFEURS',
          category_name: 'Drivers & Chauffeurs',
          services: [
            {
              service_key: 'CITY_INTERCITY_RIDES',
              service_name: 'City Rides, Intercity Rides',
              service_description:
                'City and intercity ride services using supported vehicle types.',
              available_locations: [
                {
                  location_service_key: 'city_intercity_rides_LK-CMB',
                  location_code: 'LK-CMB',
                  location_name: 'Colombo',
                  location_type: 'CITY',
                },
                {
                  location_service_key: 'city_intercity_rides_LK',
                  location_code: 'LK',
                  location_name: 'Sri Lanka',
                  location_type: 'COUNTRY',
                },
              ],
            },
            {
              service_key: 'GROUP_RIDES_SHUTTLES',
              service_name: 'Group Rides & Shuttles',
              service_description:
                'Group transport and shuttle services using larger passenger vehicles.',
              available_locations: [
                {
                  location_service_key: 'group_rides_shuttles_LK-KDY',
                  location_code: 'LK-KDY',
                  location_name: 'Kandy',
                  location_type: 'CITY',
                },
              ],
            },
          ],
        },
        {
          category_key: 'TOUR_GUIDES',
          category_name: 'Tour Guides',
          services: [
            {
              service_key: 'MUSEUM_LANDMARK_GUIDES',
              service_name: 'Museum & Landmark Guides',
              service_description:
                'Guided experiences for museums, landmarks, and important local sites.',
              available_locations: [
                {
                  location_service_key: 'museum_landmark_guides_LK-CMB',
                  location_code: 'LK-CMB',
                  location_name: 'Colombo',
                  location_type: 'CITY',
                },
                {
                  location_service_key: 'museum_landmark_guides_LK-KDY',
                  location_code: 'LK-KDY',
                  location_name: 'Kandy',
                  location_type: 'CITY',
                },
                {
                  location_service_key:
                    'museum_landmark_guides_LK-KDY-TEMPLE_OF_TOOTH',
                  location_code: 'LK-KDY-TEMPLE_OF_TOOTH',
                  location_name: 'Temple of the Tooth',
                  location_type: 'POINT',
                },
              ],
            },
          ],
        },
        {
          category_key: 'WATER_FISHING',
          category_name: 'Water & Fishing',
          services: [
            {
              service_key: 'BOATS_YACHT_SEA',
              service_name: 'Boats, Yacht, & the Sea',
              service_description:
                'Boat, yacht, and sea-based services for travelers.',
              available_locations: [
                {
                  location_service_key: 'boats_yacht_sea_LK',
                  location_code: 'LK',
                  location_name: 'Sri Lanka',
                  location_type: 'COUNTRY',
                },
              ],
            },
            {
              service_key: 'FISHING_TRIPS',
              service_name: 'Fishing Trips',
              service_description:
                'Fishing trip experiences provided by local fishing service providers.',
              available_locations: [
                {
                  location_service_key: 'fishing_trips_LK',
                  location_code: 'LK',
                  location_name: 'Sri Lanka',
                  location_type: 'COUNTRY',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should return the expected service listing for Kandy', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/services/by-location/LK-KDY')
      .expect(200);

    expect(response.body).toEqual({
      selected_location: {
        location_code: 'LK-KDY',
        name: 'Kandy',
        type: 'CITY',
      },
      categories: [
        {
          category_key: 'DRIVERS_AND_CHAUFFEURS',
          category_name: 'Drivers & Chauffeurs',
          services: [
            {
              service_key: 'GROUP_RIDES_SHUTTLES',
              service_name: 'Group Rides & Shuttles',
              service_description:
                'Group transport and shuttle services using larger passenger vehicles.',
              available_locations: [
                {
                  location_service_key: 'group_rides_shuttles_LK-KDY',
                  location_code: 'LK-KDY',
                  location_name: 'Kandy',
                  location_type: 'CITY',
                },
              ],
            },
          ],
        },
        {
          category_key: 'TOUR_GUIDES',
          category_name: 'Tour Guides',
          services: [
            {
              service_key: 'MUSEUM_LANDMARK_GUIDES',
              service_name: 'Museum & Landmark Guides',
              service_description:
                'Guided experiences for museums, landmarks, and important local sites.',
              available_locations: [
                {
                  location_service_key: 'museum_landmark_guides_LK-KDY',
                  location_code: 'LK-KDY',
                  location_name: 'Kandy',
                  location_type: 'CITY',
                },
                {
                  location_service_key:
                    'museum_landmark_guides_LK-KDY-TEMPLE_OF_TOOTH',
                  location_code: 'LK-KDY-TEMPLE_OF_TOOTH',
                  location_name: 'Temple of the Tooth',
                  location_type: 'POINT',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should return 404 for an unknown location code', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/services/by-location/NOT-EXIST')
      .expect(404);

    expect(response.body).toMatchObject({
      status: 'error',
      error_details: {
        error_code: 'resource_not_found',
        message: "Location with code 'NOT-EXIST' not found",
      },
    });
    expect(response.body.error_details.request_id).toBeDefined();
  });
});
