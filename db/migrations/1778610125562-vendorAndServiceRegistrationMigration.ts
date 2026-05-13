import { MigrationInterface, QueryRunner } from "typeorm";

export class VendorAndServiceRegistrationMigration1778610125562 implements MigrationInterface {
    name = 'VendorAndServiceRegistrationMigration1778610125562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vendor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "prefered_name" character varying NOT NULL, "gender" character varying NOT NULL, "date_of_birth" TIMESTAMP NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, "exact_location" jsonb, "short_bio" character varying NOT NULL, "languages" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "is_active" boolean NOT NULL DEFAULT true, "daily_rate" numeric, "hourly_rate" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aba8090534d8b8b8845784086c3" UNIQUE ("email"), CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_asset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset_type" character varying NOT NULL, "capacity" integer NOT NULL, "attributes" jsonb, "verification_status" character varying NOT NULL DEFAULT 'SUBMITTED', "reviewed_at" TIMESTAMP, "review_notes" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_service_id" uuid NOT NULL, CONSTRAINT "PK_c1c1c1acc8f02d0d96bffe4b0bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_pitch" character varying NOT NULL, "attributes" jsonb, "status" character varying NOT NULL DEFAULT 'SUBMITTED', "submitted_at" TIMESTAMP, "approved_at" TIMESTAMP, "rejected_at" TIMESTAMP, "reviewed_at" TIMESTAMP, "review_notes" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_id" uuid NOT NULL, "service_location_key" character varying NOT NULL, "onboarding_schema_id" uuid NOT NULL, CONSTRAINT "REL_5da3ae574b599bc82b69c38973" UNIQUE ("service_location_key"), CONSTRAINT "REL_809063343119206afda8802748" UNIQUE ("onboarding_schema_id"), CONSTRAINT "PK_a90c1368612ffbc906624652db5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_special_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_url" character varying NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "attributes" jsonb, "verification_status" character varying NOT NULL DEFAULT 'SUBMITTED', "reviewed_at" TIMESTAMP, "review_notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_service_id" uuid NOT NULL, CONSTRAINT "PK_f2aa65ec7e0775c52eecfbfc2d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vendor_asset" ADD CONSTRAINT "FK_bf9d56170e922c1679d59be96ea" FOREIGN KEY ("vendor_service_id") REFERENCES "vendor_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_521a475bb3b45cd2388d6f5b242" FOREIGN KEY ("vendor_id") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_5da3ae574b599bc82b69c38973d" FOREIGN KEY ("service_location_key") REFERENCES "location_service"("service_location_key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_809063343119206afda88027480" FOREIGN KEY ("onboarding_schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_special_data" ADD CONSTRAINT "FK_440b943819ed8061ace91366e29" FOREIGN KEY ("vendor_service_id") REFERENCES "vendor_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_special_data" DROP CONSTRAINT "FK_440b943819ed8061ace91366e29"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_809063343119206afda88027480"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_5da3ae574b599bc82b69c38973d"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_521a475bb3b45cd2388d6f5b242"`);
        await queryRunner.query(`ALTER TABLE "vendor_asset" DROP CONSTRAINT "FK_bf9d56170e922c1679d59be96ea"`);
        await queryRunner.query(`DROP TABLE "vendor_special_data"`);
        await queryRunner.query(`DROP TABLE "vendor_service"`);
        await queryRunner.query(`DROP TABLE "vendor_asset"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
    }

}
