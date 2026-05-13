import { DataSource, DataSourceOptions } from "typeorm";

const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    ssl: {
        rejectUnauthorized: false,
    },
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    migrationsTableName: "custom_migration_table",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;