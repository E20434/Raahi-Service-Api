export const SEED_AMB_ACTIVE_REF_CODE = 'ALI123';
export const SEED_AMB_ACTIVE_EMAIL = 'alice@example.com';
export const SEED_AMB_INACTIVE_REF_CODE = 'BOB456';
export const SEED_AMB_INACTIVE_EMAIL = 'bob@example.com';

export function buildAmbassadorFixture(now: Date) {
  return [
    {
      fullName: 'Alice Smith',
      refCode: SEED_AMB_ACTIVE_REF_CODE,
      email: SEED_AMB_ACTIVE_EMAIL,
      phone: '+1234567890',
      isActive: true,
      createdAt: now,
    },
    {
      fullName: 'Bob Jones',
      refCode: SEED_AMB_INACTIVE_REF_CODE,
      email: SEED_AMB_INACTIVE_EMAIL,
      isActive: false,
      createdAt: now,
    },
  ];
}
