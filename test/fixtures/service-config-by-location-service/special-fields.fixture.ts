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
      // TODO: Re-enable once Neon schema has the `display_order` column.
      // displayOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    // TODO: Re-enable once Neon schema has the `display_order` column.
    // {
    //   schemaId,
    //   entityType: 'COMPLIANCE',
    //   entityId: 'background_check',
    //   title: 'Background Check Consent',
    //   description: 'Consent required before approving the driver profile.',
    //   fieldsJson: [
    //     {
    //       type: 'CHECKBOX',
    //       label: 'I consent to a background check.',
    //       field_id: 'background_check_consent',
    //       validation: {
    //         required: true,
    //       },
    //     },
    //   ],
    //   displayOrder: 1,
    //   isActive: true,
    //   createdAt: now,
    //   updatedAt: now,
    // },
  ];
}
