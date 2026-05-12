export function buildCategoriesFixture(now: Date) {
  return [
    {
      category_key: 'DRIVERS_AND_CHAUFFEURS',
      name: 'Drivers & Chauffeurs',
      description: 'Driver and chauffeur services',
      displayOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      category_key: 'TOUR_GUIDES',
      name: 'Tour Guides',
      description: 'Tour guide services',
      displayOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      category_key: 'WATER_FISHING',
      name: 'Water & Fishing',
      description: 'Water and fishing services',
      displayOrder: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
