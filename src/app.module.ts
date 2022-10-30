import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';


import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TasksRepository } from './tasks/tasks.repository';
// import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
    }),

    TasksModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], //what modules this is dependent on
      inject: [ConfigService], //what we want to inject from those modules in useFactory

      //async function called by nestjs to initialize TypeOrmModule and will return config for module
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),

      // dataSource receives the configured DataSourceOptions
      //   and returns a Promise<DataSource>.
      //   dataSourceFactory: async (options) => {
      //       try{
      //           const dataSource = await new DataSource(options).initialize();
      //           console.log("Yeeeeee");
      //           return dataSource;
      //       }
      //       catch(error) {
      //           console.log("Neeeeeee");
      //           console.error(error);
      //       }
      //   },
    }),

    AuthModule
  ],
  //controllers: [TasksController],
  // providers: [TasksService, TasksRepository],
})
export class AppModule { }
