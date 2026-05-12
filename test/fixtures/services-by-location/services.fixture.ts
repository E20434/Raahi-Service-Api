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
    {
      service_key: 'GROUP_RIDES_SHUTTLES',
      category_key: 'DRIVERS_AND_CHAUFFEURS',
      name: 'Group Rides & Shuttles',
      description:
        'Group transport and shuttle services using larger passenger vehicles.',
      displayOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      service_key: 'MUSEUM_LANDMARK_GUIDES',
      category_key: 'TOUR_GUIDES',
      name: 'Museum & Landmark Guides',
      description:
        'Guided experiences for museums, landmarks, and important local sites.',
      displayOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      service_key: 'BOATS_YACHT_SEA',
      category_key: 'WATER_FISHING',
      name: 'Boats, Yacht, & the Sea',
      description: 'Boat, yacht, and sea-based services for travelers.',
      displayOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      service_key: 'FISHING_TRIPS',
      category_key: 'WATER_FISHING',
      name: 'Fishing Trips',
      description:
        'Fishing trip experiences provided by local fishing service providers.',
      displayOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
