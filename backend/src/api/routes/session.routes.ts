import { Router } from 'express';
import * as controller from '../../controller/session.controller';
import { extractInstituteData } from '../../middleware/institute.middleware';

const router = Router();

// Allow joining without a strict token (so guest customers can scan) but if they have a token, we extract it.
// We make auth optional for the join route by catching the error if the token is missing.
const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return extractInstituteData(req, res, next);
  }
  next();
};

router.post('/join/:token', optionalAuth, controller.join_session);
router.post('/cart/:session_token/sync', controller.sync_cart);

export default router;
