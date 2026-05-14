import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTableSetupMigration1778686705881 implements MigrationInterface {
    name = 'InitialTableSetupMigration1778686705881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vendor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "prefered_name" character varying NOT NULL, "gender" character varying NOT NULL, "date_of_birth" TIMESTAMP NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, "exact_location" jsonb, "short_bio" character varying NOT NULL, "languages" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "is_active" boolean NOT NULL DEFAULT true, "daily_rate" numeric, "hourly_rate" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aba8090534d8b8b8845784086c3" UNIQUE ("email"), CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("category_key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_84c9006a4b0fa1c1bb99427a2f1" PRIMARY KEY ("category_key"))`);
        await queryRunner.query(`CREATE TABLE "service" ("service_key" character varying NOT NULL, "category_key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_c0f7b4ac96ea29554aa9ac10333" PRIMARY KEY ("service_key"))`);
        await queryRunner.query(`CREATE TABLE "location" ("location_code" character varying NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "parent_location_code" character varying, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_e2769051a458c233a2856be320d" PRIMARY KEY ("location_code"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_onboarding_schema_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "service_onboarding_schema" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_key" character varying NOT NULL, "schema_key" character varying NOT NULL, "max_assets_allowed" integer NOT NULL, "schema_version" character varying NOT NULL, "status" "public"."service_onboarding_schema_status_enum" NOT NULL DEFAULT 'draft', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_edfba44955875949c1217febef2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location_service" ("service_location_key" character varying NOT NULL, "location_code" character varying NOT NULL, "service_key" character varying NOT NULL, "onboarding_schema_id" uuid, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_0408ae68e43c5870ce54cd6941a" PRIMARY KEY ("service_location_key"))`);
        await queryRunner.query(`CREATE TABLE "vendor_asset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset_type" character varying NOT NULL, "capacity" integer NOT NULL, "attributes" jsonb, "verification_status" character varying NOT NULL DEFAULT 'SUBMITTED', "reviewed_at" TIMESTAMP, "review_notes" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_service_id" uuid NOT NULL, CONSTRAINT "PK_c1c1c1acc8f02d0d96bffe4b0bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_pitch" character varying NOT NULL, "attributes" jsonb, "status" character varying NOT NULL DEFAULT 'SUBMITTED', "submitted_at" TIMESTAMP, "approved_at" TIMESTAMP, "rejected_at" TIMESTAMP, "reviewed_at" TIMESTAMP, "review_notes" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_id" uuid NOT NULL, "service_location_key" character varying NOT NULL, "onboarding_schema_id" uuid NOT NULL, CONSTRAINT "PK_a90c1368612ffbc906624652db5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_special_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_url" character varying NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "attributes" jsonb, "verification_status" character varying NOT NULL DEFAULT 'SUBMITTED', "reviewed_at" TIMESTAMP, "review_notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "vendor_service_id" uuid NOT NULL, CONSTRAINT "PK_f2aa65ec7e0775c52eecfbfc2d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_special_field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schema_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "fields_json" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1c00b5e2f3ca45bffab8fc64451" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schema_id" uuid NOT NULL, "asset_type_id" character varying NOT NULL, "label" character varying NOT NULL, "description" text NOT NULL, "fields_json" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9b5ee2748943131ed9d9831e8c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_585ba7fef987be8d5de8b29be3d" FOREIGN KEY ("category_key") REFERENCES "category"("category_key") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_d3d4ea6a45dde226552a3018229" FOREIGN KEY ("parent_location_code") REFERENCES "location"("location_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_onboarding_schema" ADD CONSTRAINT "FK_151c8d8ce5c04e1b60908b44fee" FOREIGN KEY ("service_key") REFERENCES "service"("service_key") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_service" ADD CONSTRAINT "FK_9dd1823772f9216f7b2058ee59a" FOREIGN KEY ("location_code") REFERENCES "location"("location_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_service" ADD CONSTRAINT "FK_5981c0728c89c5e5c735a030257" FOREIGN KEY ("service_key") REFERENCES "service"("service_key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_service" ADD CONSTRAINT "FK_c4ea16b451f21af13e0a554f062" FOREIGN KEY ("onboarding_schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_asset" ADD CONSTRAINT "FK_bf9d56170e922c1679d59be96ea" FOREIGN KEY ("vendor_service_id") REFERENCES "vendor_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_521a475bb3b45cd2388d6f5b242" FOREIGN KEY ("vendor_id") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_5da3ae574b599bc82b69c38973d" FOREIGN KEY ("service_location_key") REFERENCES "location_service"("service_location_key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_809063343119206afda88027480" FOREIGN KEY ("onboarding_schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_special_data" ADD CONSTRAINT "FK_440b943819ed8061ace91366e29" FOREIGN KEY ("vendor_service_id") REFERENCES "vendor_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_special_field" ADD CONSTRAINT "FK_e3226ecb51553d7da1425e6bb77" FOREIGN KEY ("schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_type" ADD CONSTRAINT "FK_5117368bbc0185bbcbfeee54de9" FOREIGN KEY ("schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_type" DROP CONSTRAINT "FK_5117368bbc0185bbcbfeee54de9"`);
        await queryRunner.query(`ALTER TABLE "service_special_field" DROP CONSTRAINT "FK_e3226ecb51553d7da1425e6bb77"`);
        await queryRunner.query(`ALTER TABLE "vendor_special_data" DROP CONSTRAINT "FK_440b943819ed8061ace91366e29"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_809063343119206afda88027480"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_5da3ae574b599bc82b69c38973d"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_521a475bb3b45cd2388d6f5b242"`);
        await queryRunner.query(`ALTER TABLE "vendor_asset" DROP CONSTRAINT "FK_bf9d56170e922c1679d59be96ea"`);
        await queryRunner.query(`ALTER TABLE "location_service" DROP CONSTRAINT "FK_c4ea16b451f21af13e0a554f062"`);
        await queryRunner.query(`ALTER TABLE "location_service" DROP CONSTRAINT "FK_5981c0728c89c5e5c735a030257"`);
        await queryRunner.query(`ALTER TABLE "location_service" DROP CONSTRAINT "FK_9dd1823772f9216f7b2058ee59a"`);
        await queryRunner.query(`ALTER TABLE "service_onboarding_schema" DROP CONSTRAINT "FK_151c8d8ce5c04e1b60908b44fee"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_d3d4ea6a45dde226552a3018229"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_585ba7fef987be8d5de8b29be3d"`);
        await queryRunner.query(`DROP TABLE "asset_type"`);
        await queryRunner.query(`DROP TABLE "service_special_field"`);
        await queryRunner.query(`DROP TABLE "vendor_special_data"`);
        await queryRunner.query(`DROP TABLE "vendor_service"`);
        await queryRunner.query(`DROP TABLE "vendor_asset"`);
        await queryRunner.query(`DROP TABLE "location_service"`);
        await queryRunner.query(`DROP TABLE "service_onboarding_schema"`);
        await queryRunner.query(`DROP TYPE "public"."service_onboarding_schema_status_enum"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
    }

}
