import { DataSource } from "typeorm";
import { User } from "../models/User";
import { QRCode } from "../models/QRCode";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "pg-3fc2b02b-quickqr2025-3030.d.aivencloud.com",
  port: 27591,
  username: "avnadmin",
  password: "AVNS_PXqYVw3N1qKdce-ouLJ",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
  logging: true,
  entities: [User, QRCode],
  migrations: ["src/migrations/*.ts"],
  migrationsRun: true,
  migrationsTableName: "migrations",
  migrationsTransactionMode: "all",
  subscribers: [],
}); 