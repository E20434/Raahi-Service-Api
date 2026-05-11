import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDBSetup1778416702824 implements MigrationInterface {
    name = 'InitialDBSetup1778416702824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service" ("id" uuid NOT NULL, "category_id" uuid NOT NULL, "service_key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location" ("id" uuid NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "parent_id" uuid, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location_service" ("id" uuid NOT NULL, "location_id" uuid NOT NULL, "service_id" uuid NOT NULL, "onboarding_schema_id" uuid, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_7d5334c0714ffc8e376c25261af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL, "category_key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_special_field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schema_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "fields_json" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1c00b5e2f3ca45bffab8fc64451" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_onboarding_schema" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "schema_key" character varying NOT NULL, "max_assets_allowed" integer NOT NULL, "schema_version" character varying NOT NULL, "status" "public"."service_onboarding_schema_status_enum" NOT NULL DEFAULT 'draft', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_edfba44955875949c1217febef2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schema_id" uuid NOT NULL, "asset_type_id" character varying NOT NULL, "label" character varying NOT NULL, "description" text NOT NULL, "fields_json" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9b5ee2748943131ed9d9831e8c9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "asset_type"`);
        await queryRunner.query(`DROP TABLE "service_onboarding_schema"`);
        await queryRunner.query(`DROP TABLE "service_special_field"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "location_service"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TABLE "service"`);
    }

}
