export function buildServicesFixture(now: Date) {
  return [
    {
      service_key: 'CITY_INTERCITY_RIDES',
      category_key: 'DRIVERS_AND_CHAUFFEURS',
      name: 'City Rides, Intercity Rides',
      description:
        'City and intercity ride services using supported vehicle types.',
      displayOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
