import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedToStories1790775553957 implements MigrationInterface {
    name = 'AddFeaturedToStories1790775553957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" ADD "featured" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stories" DROP COLUMN "featured"`);
    }

}
