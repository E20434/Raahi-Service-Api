export function buildLocationsFixture(now: Date) {
  return [
    {
      location_code: 'LK',
      name: 'Sri Lanka',
      type: 'COUNTRY',
      parent_location_code: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
