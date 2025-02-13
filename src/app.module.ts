import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthModule } from "./auth/auth.module";
import * as process from "node:process";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(<string>process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
