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
  maxQueryExecutionTime: 1000, // Log slow queries
  poolSize: 10, // Reduced pool size for better stability
  extra: {
    // Connection pool settings
    max: 10, // Reduced max connections
    min: 2,  // Reduced min connections
    idleTimeoutMillis: 60000, // Increased idle timeout
    connectionTimeoutMillis: 5000, // Increased connection timeout
    // Query optimization
    statement_timeout: 30000, // Increased query timeout
    idle_in_transaction_session_timeout: 30000, // Increased idle transaction timeout
    // Connection retry settings
    retry_strategy: {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      randomize: true
    }
  },
  // Use database caching instead of Redis
  cache: {
    type: "database",
    duration: 60000, // Cache duration in milliseconds
    ignoreErrors: true
  }
}); 