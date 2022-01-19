import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/userRoute.js';
import itemRouter from './routes/itemRoutes.js';
import ErrorResponse from './utils/errorResponse.js';

const app = express();

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windows: 60 * 60 * 1000,
  message: 'too many requests from this Ip, please try again in an hour!',
});

app.use('/api', limiter);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

console.log('coming');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);

app.all('*', (req, res, next) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server`, 404));
});

console.log('reach 2');

app.use(globalErrorHandler);

export default app;
