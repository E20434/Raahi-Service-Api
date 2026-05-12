export function buildSpecialFieldsFixture(schemaId: string) {
  const now = new Date();

  return [
    {
      schemaId,
      entityType: 'HUMAN',
      entityId: 'human_vendor',
      title: 'Driver Profile',
      description: 'Required credentials for the individual driver.',
      fieldsJson: [
        {
          type: 'TEXT_INPUT',
          label: 'Driver License Number',
          field_id: 'driver_license_number',
          validation: {
            required: true,
          },
          placeholder: 'Enter your local driving license number',
        },
        {
          type: 'NUMBER_INPUT',
          label: 'Years of Driving Experience',
          field_id: 'years_of_driving_experience',
          validation: {
            min: 1,
            required: true,
          },
        },
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
