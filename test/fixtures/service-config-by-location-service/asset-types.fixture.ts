export function buildAssetTypesFixture(schemaId: string) {
  const now = new Date();

  return [
    {
      schemaId,
      assetTypeId: 'CAR',
      label: 'Car',
      description: 'Standard car used for city or intercity rides in Sri Lanka.',
      assetFieldsJson: [
        {
          type: 'TEXT_INPUT',
          label: 'License Plate',
          field_id: 'license_plate',
          validation: {
            required: true,
          },
        },
        {
          type: 'NUMBER_INPUT',
          label: 'Vehicle Year',
          field_id: 'vehicle_year',
          validation: {
            min: 2010,
            required: true,
          },
        },
      ],
      displayOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      schemaId,
      assetTypeId: 'SUV',
      label: 'SUV',
      description: 'SUV used for city or intercity rides in Sri Lanka.',
      assetFieldsJson: [
        {
          type: 'TEXT_INPUT',
          label: 'License Plate',
          field_id: 'license_plate',
          validation: {
            required: true,
          },
        },
        {
          type: 'NUMBER_INPUT',
          label: 'Vehicle Year',
          field_id: 'vehicle_year',
          validation: {
            min: 2010,
            required: true,
          },
        },
        {
          type: 'NUMBER_INPUT',
          label: 'Passenger Seats',
          field_id: 'passenger_seats',
          validation: {
            min: 4,
            required: true,
          },
        },
      ],
      displayOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
