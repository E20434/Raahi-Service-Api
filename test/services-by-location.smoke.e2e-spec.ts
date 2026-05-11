import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

jest.setTimeout(180_000);

describe('Services By Location Smoke (e2e)', () => {
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    expect(container.getHost()).toBeDefined();
    expect(container.getPort()).toBeGreaterThan(0);
    expect(container.getUsername()).toBeDefined();
    expect(container.getPassword()).toBeDefined();
    expect(container.getDatabase()).toBeDefined();
  });

  afterAll(async () => {
    if (container) {
      await container.stop();
    }
  });

  it('should start PostgreSQL Testcontainer', () => {
    expect(container).toBeDefined();
    expect(container.getHost()).toBeDefined();
    expect(container.getPort()).toBeGreaterThan(0);
  });
});
