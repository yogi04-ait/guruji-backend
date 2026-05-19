import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './database.js';
import testimonialRouter from './Routes/testimonials.js';

import companyRouter from './Routes/company.route.js';
import authRouter from './Routes/auth.js';
import hiringPartnerRouter from './Routes/hiringPartner.js';
import applicantRouter from './Routes/applicants.js';
import enquiryRouter from './Routes/enquiry.js';

import { globalLimiter } from './middleware/ratelimiter.js';

dotenv.config();

const app = express();


app.disable("x-powered-by");
app.use(compression());

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses form data
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
  })
);

app.use(rateLimit({ windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes' }) );

app.use('/', authRouter);
app.use('/', hiringPartnerRouter);
app.use('/', companyRouter);
app.use('/', applicantRouter);
app.use('/', testimonialRouter);
app.use('/', enquiryRouter);


connectDB()
  .then(() => {
    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });

  