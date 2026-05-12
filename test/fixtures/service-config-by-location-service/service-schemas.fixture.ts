import { SchemaStatus } from '../../../src/modules/schema/entities';

export function buildServiceSchemasFixture(schemaId: string) {
  const now = new Date();

  return [
    {
      id: schemaId,
      serviceKey: 'CITY_INTERCITY_RIDES',
      schemaKey: 'CITY_INTERCITY_RIDES',
      maxAssetsAllowed: 1,
      schemaVersion: '1.0',
      status: SchemaStatus.PUBLISHED,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
