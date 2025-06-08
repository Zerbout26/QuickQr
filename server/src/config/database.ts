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
  logging: process.env.NODE_ENV === 'development',
  entities: [User, QRCode],
  migrations: ["src/migrations/*.ts"],
  migrationsRun: true,
  migrationsTableName: "migrations",
  migrationsTransactionMode: "all",
  subscribers: [],
  // Performance optimizations
  maxQueryExecutionTime: 1000, // Log slow queries 1
  poolSize: 20, // Increased pool size for better concurrency
  extra: {
    // Connection pool settings
    max: 20, // Increased max connections
    min: 5,  // Increased min connections
    idleTimeoutMillis: 30000, // Reduced idle timeout
    connectionTimeoutMillis: 3000, // Reduced connection timeout
    // Query optimization
    statement_timeout: 15000, // Reduced query timeout
    idle_in_transaction_session_timeout: 15000, // Reduced idle transaction timeout
    // Connection retry settings
    retry_strategy: {
      retries: 3,
      factor: 2,
      minTimeout: 500,
      maxTimeout: 2000,
      randomize: true
    }
  },
  // Use database caching instead of Redis
  cache: {
    type: "database",
    duration: 30000, // Reduced cache duration for more frequent updates
    ignoreErrors: true
  }
}); 