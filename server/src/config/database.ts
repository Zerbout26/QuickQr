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
  poolSize: 20, // Connection pool size
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Connection timeout
    // Query optimization
    statement_timeout: 10000, // Query timeout
    idle_in_transaction_session_timeout: 10000, // Idle transaction timeout
  },
  cache: {
    duration: 60000, // Cache duration in milliseconds
    type: "ioredis", // Use Redis for caching if available
  }
}); 