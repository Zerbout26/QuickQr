import { DataSource } from "typeorm";
import { User } from "../models/User";
import { QRCode } from "../models/QRCode";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: true,
  entities: [User, QRCode],
  migrations: [],
  subscribers: [],
}); 