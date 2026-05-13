import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';

import connectDB from './database.js';
import testimonialRouter from './Routes/testimonials.js';

import companyRouter from './Routes/company.route.js';
import authRouter from './Routes/auth.js';
import hiringPartnerRouter from './Routes/hiringPartner.js';
import applicantRouter from './Routes/applicants.js';

import { globalLimiter } from './middleware/ratelimiter.js';

dotenv.config();

const app = express();

app.disable("x-powered-by");

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
  })
);

app.use('/', authRouter);
app.use('/', hiringPartnerRouter);
app.use('/', companyRouter);
app.use('/', applicantRouter);
app.use('/', testimonialRouter);

connectDB()
  .then(() => {
    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });