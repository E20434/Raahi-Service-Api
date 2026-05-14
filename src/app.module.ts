import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceModule } from './modules/service/service.module';

// (later you will import feature modules here)
import { SchemaModule } from './modules/schema/schema.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { VendorModule } from './modules/vendor/vendor.module';
import { AmbassadorModule } from './modules/ambassador/ambassador.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //  Database (Neon PostgreSQL)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        //  connection string
        //uncomment this to test with neon db
        //url: config.get<string>('DATABASE_URL'),
     
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT') || 5444),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),

        // Auto load entities (from feature modules)
        autoLoadEntities: true,

        //  NEVER true in production
        synchronize: false,

        // Required for Neon (SSL)
        ssl: {
          rejectUnauthorized: false,
        },

        // Serverless-safe pooling
        extra: {
          max: 5, // keep small
        },

        // Optional but useful
        logging: true, // turn off in prod later
      }),
    }),

    ServiceModule,
    SchemaModule,
    VendorModule,
    AmbassadorModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
