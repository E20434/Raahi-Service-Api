export function buildLocationsFixture(now: Date) {
  return [
    {
      location_code: 'LK',
      name: 'Sri Lanka',
      type: 'COUNTRY',
      parent_location_code: null as unknown as string,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      location_code: 'LK-CMB',
      name: 'Colombo',
      type: 'CITY',
      parent_location_code: 'LK',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      location_code: 'LK-KDY',
      name: 'Kandy',
      type: 'CITY',
      parent_location_code: 'LK',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      location_code: 'LK-KDY-TEMPLE_OF_TOOTH',
      name: 'Temple of the Tooth',
      type: 'POINT',
      parent_location_code: 'LK-KDY',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      location_code: 'LK-GAL',
      name: 'Galle',
      type: 'CITY',
      parent_location_code: 'LK',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
