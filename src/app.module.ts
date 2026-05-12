import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceModule } from './modules/service/service.module';

// (later you will import feature modules here)
import { SchemaModule } from './modules/schema/schema.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
        url: config.get<string>('DATABASE_URL'),

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
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}