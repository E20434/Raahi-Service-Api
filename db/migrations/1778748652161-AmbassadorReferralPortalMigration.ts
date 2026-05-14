import { MigrationInterface, QueryRunner } from "typeorm";

export class AmbassadorReferralPortalMigration1778748652161 implements MigrationInterface {
    name = 'AmbassadorReferralPortalMigration1778748652161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ambassador" ("amb_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "ref_code" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "payout_details" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_40ad50580964a0bca4ae27e919d" UNIQUE ("ref_code"), CONSTRAINT "UQ_ff108ff416a1efdeff7e74eb0f7" UNIQUE ("email"), CONSTRAINT "PK_9e3cb086fbd143d8d49a996fe2e" PRIMARY KEY ("amb_id"))`);
        await queryRunner.query(`ALTER TABLE "vendor" ADD "ref_code_used" character varying`);
        await queryRunner.query(`ALTER TABLE "vendor" ADD "business_name" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."vendor_onboarding_status_enum" AS ENUM('PENDING', 'UNDER_REVIEW', 'ONBOARDED')`);
        await queryRunner.query(`ALTER TABLE "vendor" ADD "onboarding_status" "public"."vendor_onboarding_status_enum"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_d3d4ea6a45dde226552a3018229"`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "UQ_d3d4ea6a45dde226552a3018229" UNIQUE ("parent_location_code")`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_5da3ae574b599bc82b69c38973d"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_809063343119206afda88027480"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "UQ_5da3ae574b599bc82b69c38973d" UNIQUE ("service_location_key")`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "UQ_809063343119206afda88027480" UNIQUE ("onboarding_schema_id")`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_d3d4ea6a45dde226552a3018229" FOREIGN KEY ("parent_location_code") REFERENCES "location"("location_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_5da3ae574b599bc82b69c38973d" FOREIGN KEY ("service_location_key") REFERENCES "location_service"("service_location_key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_809063343119206afda88027480" FOREIGN KEY ("onboarding_schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_809063343119206afda88027480"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "FK_5da3ae574b599bc82b69c38973d"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_d3d4ea6a45dde226552a3018229"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "UQ_809063343119206afda88027480"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" DROP CONSTRAINT "UQ_5da3ae574b599bc82b69c38973d"`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_809063343119206afda88027480" FOREIGN KEY ("onboarding_schema_id") REFERENCES "service_onboarding_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor_service" ADD CONSTRAINT "FK_5da3ae574b599bc82b69c38973d" FOREIGN KEY ("service_location_key") REFERENCES "location_service"("service_location_key") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "UQ_d3d4ea6a45dde226552a3018229"`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_d3d4ea6a45dde226552a3018229" FOREIGN KEY ("parent_location_code") REFERENCES "location"("location_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "onboarding_status"`);
        await queryRunner.query(`DROP TYPE "public"."vendor_onboarding_status_enum"`);
        await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "business_name"`);
        await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "ref_code_used"`);
        await queryRunner.query(`DROP TABLE "ambassador"`);
    }

}
