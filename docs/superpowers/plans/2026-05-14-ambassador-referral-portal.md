# Ambassador Referral Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 3 API endpoints for the Ambassador Referral Portal — create ambassador, vendor registration via referral code, and ambassador referrals dashboard.

**Architecture:** New `AmbassadorModule` added alongside existing modules. New `ambassador` table and three nullable columns on `vendor` table. A single TypeORM migration handles all schema changes. No modifications to existing module logic.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL (Neon), class-validator, Jest 30

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/modules/vendor/enums/vendor.enum.ts` | Modify | Add `OnboardingStatus` enum |
| `src/modules/vendor/entities/vendor.entity.ts` | Modify | Add `refCodeUsed`, `businessName`, `onboardingStatus` columns |
| `src/common/exceptions/custom.exception.ts` | Modify | Add `ConflictException`, `InternalServerException` |
| `src/modules/ambassador/entities/ambassador.entity.ts` | Create | TypeORM entity for `ambassador` table |
| `src/modules/ambassador/dtos/ambassador.dto.ts` | Create | Request/response DTOs for all 3 endpoints |
| `src/modules/ambassador/ambassador.service.ts` | Create | Business logic: create ambassador, vendor registration, referrals dashboard |
| `src/modules/ambassador/ambassador.service.spec.ts` | Create | Unit tests for all service behaviors |
| `src/modules/ambassador/ambassador.controller.ts` | Create | HTTP handlers for 3 endpoints at `/api/v1/ambassador` |
| `src/modules/ambassador/ambassador.module.ts` | Create | NestJS module wiring |
| `src/app.module.ts` | Modify | Register `AmbassadorModule` |
| `db/migrations/<timestamp>-AmbassadorReferralPortalMigration.ts` | Create | DB schema migration (auto-generated) |

---

## Task 1: Extend vendor enum and entity with ambassador fields

**Files:**
- Modify: `src/modules/vendor/enums/vendor.enum.ts`
- Modify: `src/modules/vendor/entities/vendor.entity.ts`

- [ ] **Step 1: Add `OnboardingStatus` to `src/modules/vendor/enums/vendor.enum.ts`**

Replace the entire file content with:

```typescript
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Unspecified = 'Unspecified',
}

export enum VendorStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum OnboardingStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ONBOARDED = 'ONBOARDED',
}
```

- [ ] **Step 2: Add 3 nullable columns to `src/modules/vendor/entities/vendor.entity.ts`**

Update the import at the top to include `OnboardingStatus`:

```typescript
import { VendorStatus, Gender, OnboardingStatus } from '../enums/vendor.enum';
```

Add these three fields after the `hourlyRate` column (before `createdAt`):

```typescript
  @Column({ name: 'ref_code_used', type: 'varchar', nullable: true })
  refCodeUsed?: string;

  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  businessName?: string;

  @Column({
    name: 'onboarding_status',
    type: 'enum',
    enum: OnboardingStatus,
    nullable: true,
  })
  onboardingStatus?: OnboardingStatus;
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/vendor/enums/vendor.enum.ts src/modules/vendor/entities/vendor.entity.ts
git commit -m "feat: add OnboardingStatus enum and ambassador fields to vendor entity"
```

---

## Task 2: Create AmbassadorEntity

**Files:**
- Create: `src/modules/ambassador/entities/ambassador.entity.ts`

- [ ] **Step 1: Create the file**

```typescript
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ambassador')
export class AmbassadorEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'amb_id' })
  ambId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'ref_code', unique: true })
  refCode: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'payout_details', type: 'text', nullable: true })
  payoutDetails?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/ambassador/entities/ambassador.entity.ts
git commit -m "feat: add AmbassadorEntity"
```

---

## Task 3: Add exceptions and create ambassador DTOs

**Files:**
- Modify: `src/common/exceptions/custom.exception.ts`
- Create: `src/modules/ambassador/dtos/ambassador.dto.ts`

- [ ] **Step 1: Append `ConflictException` and `InternalServerException` to `src/common/exceptions/custom.exception.ts`**

Add to the end of the file:

```typescript
export class ConflictException extends CustomHttpException {
  constructor(message: string) {
    super(
      { error_code: 'conflict', message },
      HttpStatus.CONFLICT,
    );
  }
}

export class InternalServerException extends CustomHttpException {
  constructor(message: string) {
    super(
      { error_code: 'internal_server_error', message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

- [ ] **Step 2: Create `src/modules/ambassador/dtos/ambassador.dto.ts`**

```typescript
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { OnboardingStatus } from '../../vendor/enums/vendor.enum';

export class CreateAmbassadorDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  payout_details?: string;
}

export class AmbassadorResponseDto {
  amb_id: string;
  full_name: string;
  ref_code: string;
  email: string;
  phone?: string;
  payout_details?: string;
  is_active: boolean;
  created_at: Date;
}

export class AmbassadorVendorRegisterDto {
  @IsString()
  ref_code: string;

  @IsString()
  business_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;
}

export class AmbassadorVendorResponseDto {
  id: string;
  email: string;
  business_name: string;
  ref_code_used: string;
  onboarding_status: OnboardingStatus;
  created_at: Date;
}

export class ReferralVendorDto {
  business_name: string;
  status: OnboardingStatus;
  registered_at: Date;
}

export class ReferralsDashboardResponseDto {
  ref_code: string;
  total: number;
  vendors: ReferralVendorDto[];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/common/exceptions/custom.exception.ts src/modules/ambassador/dtos/ambassador.dto.ts
git commit -m "feat: add ConflictException, InternalServerException, and ambassador DTOs"
```

---

## Task 4: Write failing AmbassadorService tests (TDD)

**Files:**
- Create: `src/modules/ambassador/ambassador.service.ts` (stub — all methods throw)
- Create: `src/modules/ambassador/ambassador.service.spec.ts`

- [ ] **Step 1: Create stub `src/modules/ambassador/ambassador.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import {
  CreateAmbassadorDto,
  AmbassadorResponseDto,
  AmbassadorVendorRegisterDto,
  AmbassadorVendorResponseDto,
  ReferralsDashboardResponseDto,
} from './dtos/ambassador.dto';

@Injectable()
export class AmbassadorService {
  constructor(
    @InjectRepository(AmbassadorEntity)
    private readonly ambassadorRepository: Repository<AmbassadorEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>,
  ) {}

  async createAmbassador(_dto: CreateAmbassadorDto): Promise<AmbassadorResponseDto> {
    throw new Error('not implemented');
  }

  async vendorRegistration(_dto: AmbassadorVendorRegisterDto): Promise<AmbassadorVendorResponseDto> {
    throw new Error('not implemented');
  }

  async getReferrals(_refCode: string): Promise<ReferralsDashboardResponseDto> {
    throw new Error('not implemented');
  }
}
```

- [ ] **Step 2: Create `src/modules/ambassador/ambassador.service.spec.ts`**

```typescript
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
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=ambassador.service.spec --verbose
```

Expected: All tests FAIL with `Error: not implemented`

- [ ] **Step 4: Commit**

```bash
git add src/modules/ambassador/ambassador.service.ts src/modules/ambassador/ambassador.service.spec.ts
git commit -m "test: add failing unit tests for AmbassadorService (TDD)"
```

---

## Task 5: Implement AmbassadorService to make tests pass

**Files:**
- Modify: `src/modules/ambassador/ambassador.service.ts`

- [ ] **Step 1: Replace the stub with the full implementation**

Replace the entire file content of `src/modules/ambassador/ambassador.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import { OnboardingStatus, Gender } from '../vendor/enums/vendor.enum';
import {
  CreateAmbassadorDto,
  AmbassadorResponseDto,
  AmbassadorVendorRegisterDto,
  AmbassadorVendorResponseDto,
  ReferralsDashboardResponseDto,
} from './dtos/ambassador.dto';
import {
  ConflictException,
  ResourceNotFoundException,
  BadRequestException,
  InternalServerException,
} from '../../common/exceptions/custom.exception';

@Injectable()
export class AmbassadorService {
  constructor(
    @InjectRepository(AmbassadorEntity)
    private readonly ambassadorRepository: Repository<AmbassadorEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>,
  ) {}

  async createAmbassador(dto: CreateAmbassadorDto): Promise<AmbassadorResponseDto> {
    const existing = await this.ambassadorRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Ambassador already exists');
    }

    const refCode = await this.generateRefCode(dto.full_name);

    const ambassador = await this.ambassadorRepository.save({
      fullName: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      payoutDetails: dto.payout_details,
      refCode,
      isActive: true,
    } as AmbassadorEntity);

    return this.toAmbassadorResponseDto(ambassador);
  }

  async vendorRegistration(dto: AmbassadorVendorRegisterDto): Promise<AmbassadorVendorResponseDto> {
    const ambassador = await this.ambassadorRepository.findOne({ where: { refCode: dto.ref_code } });
    if (!ambassador) {
      throw new ResourceNotFoundException('Referral code not found');
    }
    if (!ambassador.isActive) {
      throw new BadRequestException('Referral code is inactive');
    }

    const existingVendor = await this.vendorRepository.findOne({ where: { email: dto.email } });
    if (existingVendor) {
      throw new ConflictException('Vendor with this email already exists');
    }

    const vendor = await this.vendorRepository.save({
      firstName: '',
      lastName: '',
      preferedName: dto.business_name,
      gender: Gender.Unspecified,
      dateOfBirth: new Date('1900-01-01'),
      email: dto.email,
      phoneNumber: dto.phone,
      country: '',
      city: '',
      shortBio: '',
      languages: [],
      refCodeUsed: dto.ref_code,
      businessName: dto.business_name,
      onboardingStatus: OnboardingStatus.PENDING,
    } as unknown as VendorEntity);

    return {
      id: vendor.id,
      email: vendor.email,
      business_name: vendor.businessName!,
      ref_code_used: vendor.refCodeUsed!,
      onboarding_status: vendor.onboardingStatus!,
      created_at: vendor.createdAt,
    };
  }

  async getReferrals(refCode: string): Promise<ReferralsDashboardResponseDto> {
    const ambassador = await this.ambassadorRepository.findOne({ where: { refCode } });
    if (!ambassador) {
      throw new ResourceNotFoundException('Ambassador not found');
    }

    const vendors = await this.vendorRepository.find({ where: { refCodeUsed: refCode } });

    return {
      ref_code: refCode,
      total: vendors.length,
      vendors: vendors.map((v) => ({
        business_name: v.businessName ?? '',
        status: v.onboardingStatus ?? OnboardingStatus.PENDING,
        registered_at: v.createdAt,
      })),
    };
  }

  private async generateRefCode(fullName: string): Promise<string> {
    const prefix = fullName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.floor(Math.random() * 900) + 100;
      const candidate = `${prefix}${suffix}`;
      const existing = await this.ambassadorRepository.findOne({ where: { refCode: candidate } });
      if (!existing) return candidate;
    }

    throw new InternalServerException('Failed to generate unique referral code');
  }

  private toAmbassadorResponseDto(entity: AmbassadorEntity): AmbassadorResponseDto {
    return {
      amb_id: entity.ambId,
      full_name: entity.fullName,
      ref_code: entity.refCode,
      email: entity.email,
      phone: entity.phone,
      payout_details: entity.payoutDetails,
      is_active: entity.isActive,
      created_at: entity.createdAt,
    };
  }
}
```

- [ ] **Step 2: Run tests to confirm they all pass**

```bash
npm test -- --testPathPattern=ambassador.service.spec --verbose
```

Expected: All 11 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/modules/ambassador/ambassador.service.ts
git commit -m "feat: implement AmbassadorService"
```

---

## Task 6: Wire up controller, module, and AppModule

**Files:**
- Create: `src/modules/ambassador/ambassador.controller.ts`
- Create: `src/modules/ambassador/ambassador.module.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create `src/modules/ambassador/ambassador.controller.ts`**

```typescript
import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AmbassadorService } from './ambassador.service';
import { CreateAmbassadorDto, AmbassadorVendorRegisterDto } from './dtos/ambassador.dto';
import {
  ResourceNotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerException,
} from '../../common/exceptions/custom.exception';

@Controller('api/v1/ambassador')
export class AmbassadorController {
  constructor(private readonly ambassadorService: AmbassadorService) {}

  @Post()
  async createAmbassador(@Body() dto: CreateAmbassadorDto) {
    try {
      return await this.ambassadorService.createAmbassador(dto);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ResourceNotFoundException ||
        error instanceof InternalServerException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create ambassador',
      );
    }
  }

  @Post('vendor/register')
  async registerVendor(@Body() dto: AmbassadorVendorRegisterDto) {
    try {
      return await this.ambassadorService.vendorRegistration(dto);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ResourceNotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to register vendor',
      );
    }
  }

  @Get('referrals')
  async getReferrals(@Query('ref_code') refCode: string) {
    if (!refCode) {
      throw new BadRequestException('ref_code query parameter is required');
    }
    try {
      return await this.ambassadorService.getReferrals(refCode);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to retrieve referrals',
      );
    }
  }
}
```

- [ ] **Step 2: Create `src/modules/ambassador/ambassador.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbassadorEntity } from './entities/ambassador.entity';
import { VendorEntity } from '../vendor/entities/vendor.entity';
import { AmbassadorController } from './ambassador.controller';
import { AmbassadorService } from './ambassador.service';

@Module({
  imports: [TypeOrmModule.forFeature([AmbassadorEntity, VendorEntity])],
  controllers: [AmbassadorController],
  providers: [AmbassadorService],
})
export class AmbassadorModule {}
```

- [ ] **Step 3: Add `AmbassadorModule` to `src/app.module.ts`**

Add the import statement at the top:
```typescript
import { AmbassadorModule } from './modules/ambassador/ambassador.module';
```

Add `AmbassadorModule` to the `imports` array alongside `ServiceModule`, `SchemaModule`, `VendorModule`:
```typescript
    ServiceModule,
    SchemaModule,
    VendorModule,
    AmbassadorModule,
```

- [ ] **Step 4: Verify the project compiles**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors. Output appears in `dist/`.

- [ ] **Step 5: Commit**

```bash
git add src/modules/ambassador/ambassador.controller.ts src/modules/ambassador/ambassador.module.ts src/app.module.ts
git commit -m "feat: add AmbassadorController, AmbassadorModule, wire into AppModule"
```

---

## Task 7: Generate and run the DB migration

**Files:**
- Create: `db/migrations/<timestamp>-AmbassadorReferralPortalMigration.ts` (auto-generated)

- [ ] **Step 1: Generate the migration**

```bash
npm run migration:generate -- db/migrations/AmbassadorReferralPortalMigration
```

TypeORM diffs the entity definitions against the live DB and writes a new file in `db/migrations/`. It will have a timestamp prefix (e.g. `1778712345678-AmbassadorReferralPortalMigration.ts`).

- [ ] **Step 2: Open the generated file and verify it contains these 4 changes**

1. `CREATE TABLE "ambassador"` with columns: `amb_id`, `full_name`, `ref_code` (UNIQUE), `email` (UNIQUE), `phone`, `payout_details`, `is_active`, `created_at`
2. `ALTER TABLE "vendor" ADD "ref_code_used"` (varchar, nullable)
3. `ALTER TABLE "vendor" ADD "business_name"` (varchar, nullable)
4. `CREATE TYPE "public"."vendor_onboarding_status_enum"` + `ALTER TABLE "vendor" ADD "onboarding_status"` (enum type, nullable)

If any of these are missing, add them manually following the SQL style of the existing migrations in `db/migrations/`.

- [ ] **Step 3: Run the migration**

```bash
npm run migration:run
```

Expected: TypeORM prints the SQL statements as it runs them, ending with a row inserted into `custom_migration_table`. No errors.

- [ ] **Step 4: Commit the migration file**

```bash
git add db/migrations/
git commit -m "feat: add ambassador referral portal migration"
```
