import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocationParentManyToOneFix1778672195088
  implements MigrationInterface
{
  name = 'LocationParentManyToOneFix1778672195088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "REL_d3d4ea6a45dde226552a301822"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "REL_d3d4ea6a45dde226552a301822" UNIQUE ("parent_location_code")`,
    );
  }
}
