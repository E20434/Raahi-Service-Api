import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmbassadorService } from './ambassador.service';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import { OnboardingStatus } from '../vendor/enums/vendor.enum';
import {
  ConflictException,
  ResourceNotFoundException,
  BadRequestException,
} from '../../common/exceptions/custom.exception';

const mockAmbassadorRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockVendorRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('AmbassadorService', () => {
  let service: AmbassadorService;
  let ambassadorRepo: ReturnType<typeof mockAmbassadorRepo>;
  let vendorRepo: ReturnType<typeof mockVendorRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmbassadorService,
        { provide: getRepositoryToken(AmbassadorEntity), useFactory: mockAmbassadorRepo },
        { provide: getRepositoryToken(VendorEntity), useFactory: mockVendorRepo },
      ],
    }).compile();

    service = module.get<AmbassadorService>(AmbassadorService);
    ambassadorRepo = module.get(getRepositoryToken(AmbassadorEntity));
    vendorRepo = module.get(getRepositoryToken(VendorEntity));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createAmbassador', () => {
    it('generates a ref_code with correct 3-letter uppercase prefix from full_name', async () => {
      ambassadorRepo.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // ref_code uniqueness
      ambassadorRepo.save.mockImplementation((entity: Partial<AmbassadorEntity>) =>
        Promise.resolve({ ...entity, ambId: 'uuid-1', isActive: true, createdAt: new Date() } as AmbassadorEntity),
      );

      await service.createAmbassador({ full_name: 'Jane Doe', email: 'jane@example.com' });

      expect(ambassadorRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ refCode: expect.stringMatching(/^JAN\d{3}$/) }),
      );
    });

    it('creates ambassador successfully and returns the full record', async () => {
      ambassadorRepo.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // ref_code uniqueness
      const saved: AmbassadorEntity = {
        ambId: 'uuid-1',
        fullName: 'Jane Doe',
        refCode: 'JAN472',
        email: 'jane@example.com',
        phone: '0771234567',
        isActive: true,
        createdAt: new Date('2026-05-14T10:00:00Z'),
      } as AmbassadorEntity;
      ambassadorRepo.save.mockResolvedValue(saved);

      const result = await service.createAmbassador({
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0771234567',
      });

      expect(result.amb_id).toBe('uuid-1');
      expect(result.full_name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(result.ref_code).toBe('JAN472');
      expect(ambassadorRepo.save).toHaveBeenCalledTimes(1);
    });

    it('retries ref_code generation on collision and succeeds within 5 attempts', async () => {
      ambassadorRepo.findOne
        .mockResolvedValueOnce(null)                                       // email check
        .mockResolvedValueOnce({ refCode: 'JAN100' } as AmbassadorEntity) // attempt 1 collision
        .mockResolvedValueOnce({ refCode: 'JAN200' } as AmbassadorEntity) // attempt 2 collision
        .mockResolvedValueOnce(null);                                      // attempt 3 unique
      ambassadorRepo.save.mockImplementation((entity: Partial<AmbassadorEntity>) =>
        Promise.resolve({ ...entity, ambId: 'uuid-2', isActive: true, createdAt: new Date() } as AmbassadorEntity),
      );

      const result = await service.createAmbassador({
        full_name: 'Jane Doe',
        email: 'jane2@example.com',
      });

      expect(result.amb_id).toBe('uuid-2');
      expect(ambassadorRepo.save).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException if ambassador email already exists', async () => {
      ambassadorRepo.findOne.mockResolvedValueOnce({ email: 'jane@example.com' } as AmbassadorEntity);

      await expect(
        service.createAmbassador({ full_name: 'Jane Doe', email: 'jane@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(ambassadorRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('vendorRegistration', () => {
    it('registers a vendor successfully with a valid active ref_code', async () => {
      ambassadorRepo.findOne.mockResolvedValue({
        ambId: 'amb-1',
        refCode: 'RAA007',
        isActive: true,
      } as AmbassadorEntity);
      vendorRepo.findOne.mockResolvedValue(null); // no duplicate email
      const saved = {
        id: 'vendor-uuid',
        email: 'vendor@example.com',
        businessName: 'Sunset Tours',
        refCodeUsed: 'RAA007',
        onboardingStatus: OnboardingStatus.PENDING,
        createdAt: new Date('2026-05-14T10:00:00Z'),
      } as unknown as VendorEntity;
      vendorRepo.save.mockResolvedValue(saved);

      const result = await service.vendorRegistration({
        ref_code: 'RAA007',
        business_name: 'Sunset Tours',
        email: 'vendor@example.com',
        phone: '0771234567',
      });

      expect(result.id).toBe('vendor-uuid');
      expect(result.onboarding_status).toBe(OnboardingStatus.PENDING);
      expect(result.ref_code_used).toBe('RAA007');
      expect(result.business_name).toBe('Sunset Tours');
    });

    it('throws ResourceNotFoundException if ref_code does not exist', async () => {
      ambassadorRepo.findOne.mockResolvedValue(null);

      await expect(
        service.vendorRegistration({
          ref_code: 'NOTREAL',
          business_name: 'Test Co',
          email: 'test@example.com',
          phone: '0771111111',
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);

      expect(vendorRepo.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException if ref_code is inactive', async () => {
      ambassadorRepo.findOne.mockResolvedValue({
        ambId: 'amb-2',
        refCode: 'RAA007',
        isActive: false,
      } as AmbassadorEntity);

      await expect(
        service.vendorRegistration({
          ref_code: 'RAA007',
          business_name: 'Test Co',
          email: 'test@example.com',
          phone: '0771111111',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(vendorRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException if vendor email already exists', async () => {
      ambassadorRepo.findOne.mockResolvedValue({
        ambId: 'amb-3',
        refCode: 'RAA007',
        isActive: true,
      } as AmbassadorEntity);
      vendorRepo.findOne.mockResolvedValue({ email: 'vendor@example.com' } as VendorEntity);

      await expect(
        service.vendorRegistration({
          ref_code: 'RAA007',
          business_name: 'Test Co',
          email: 'vendor@example.com',
          phone: '0771111111',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(vendorRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getReferrals', () => {
    it('returns referrals dashboard with vendor list', async () => {
      ambassadorRepo.findOne.mockResolvedValue({
        ambId: 'amb-1',
        refCode: 'RAA007',
      } as AmbassadorEntity);
      vendorRepo.find.mockResolvedValue([
        {
          businessName: 'Sunset Tours',
          onboardingStatus: OnboardingStatus.PENDING,
          createdAt: new Date('2026-05-13T10:00:00.000Z'),
        } as unknown as VendorEntity,
        {
          businessName: 'Hill Treks',
          onboardingStatus: OnboardingStatus.UNDER_REVIEW,
          createdAt: new Date('2026-05-14T08:00:00.000Z'),
        } as unknown as VendorEntity,
      ]);

      const result = await service.getReferrals('RAA007');

      expect(result.ref_code).toBe('RAA007');
      expect(result.total).toBe(2);
      expect(result.vendors[0].business_name).toBe('Sunset Tours');
      expect(result.vendors[0].status).toBe(OnboardingStatus.PENDING);
      expect(result.vendors[1].business_name).toBe('Hill Treks');
    });

    it('returns empty vendors array when ambassador has no recruits', async () => {
      ambassadorRepo.findOne.mockResolvedValue({
        ambId: 'amb-1',
        refCode: 'RAA007',
      } as AmbassadorEntity);
      vendorRepo.find.mockResolvedValue([]);

      const result = await service.getReferrals('RAA007');

      expect(result.total).toBe(0);
      expect(result.vendors).toEqual([]);
    });

    it('throws ResourceNotFoundException if ambassador not found', async () => {
      ambassadorRepo.findOne.mockResolvedValue(null);

      await expect(service.getReferrals('NOTREAL')).rejects.toBeInstanceOf(ResourceNotFoundException);

      expect(vendorRepo.find).not.toHaveBeenCalled();
    });
  });
});
