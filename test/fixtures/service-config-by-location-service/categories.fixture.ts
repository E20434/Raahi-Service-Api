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
  ];
}
