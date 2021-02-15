import { Router } from 'express';
import club from './routes/club';

export default (): Router => {
  const app = Router();
  club(app);

  return app;
};
