import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import appRouter from './routes/index';
import db from './configs/database.config';
import { NextFunction, Request, Response } from 'express';
import AppError from './utils/appError';
import { errorHandler } from './controllers/Error.controller';
import logger from './logger/winston';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// import {xss} from 'xss-clean/lib/xss';


//Connect to db
db.connect();
const app = express();
// Set security HHTP headers
app.use(helmet());
const port = process.env.PORT || 8080;

app.use(cors());

// Development logger
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000, //1hour
   standardHeaders: 'draft-7',
   legacyHeaders: false,
   message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
   bodyParser.json({
      limit: '100kb',
   }),
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss())

//Static file
app.use(express.static(`${__dirname}/assets`));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', appRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
   logger.error(`Can't find ${req.originalUrl} on this server`);
   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error
app.use(errorHandler);

const server = app.listen(port, () => {
   return console.log(`Server is listening at http://localhost:${port}`);
});

process.on('unhandledRejection', (err: any) => {
   console.log('UNHANDLED Rejection! 💣 Shutting down...');
   console.log(err.name, err.message);
   server.close(() => {
      process.exit(1);
   });
});

process.on('uncaughtException', (err: any) => {
   console.log('UNCAUGHT Exception! 💣 Shutting down...');
   console.log(err.name, err.message);
   server.close(() => {
      process.exit(1);
   });
});

export default app;