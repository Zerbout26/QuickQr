import express from 'express';
import cors from 'cors';
import compression from 'compression';

const app = express();

// Enable compression for all responses
app.use(compression());

// ... existing code ... 