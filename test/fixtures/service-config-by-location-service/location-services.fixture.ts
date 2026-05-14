export function buildLocationServicesFixture(now: Date, schemaId: string) {
  return [
    {
      service_location_key: 'city_intercity_rides_LK',
      location_code: 'LK',
      service_key: 'CITY_INTERCITY_RIDES',
      onboardingSchemaId: schemaId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
