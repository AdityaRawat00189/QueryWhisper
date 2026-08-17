import express from 'express';

import { saveCredentials } from '../controllers/saveCredentials.controller.js';

const router = express.Router();

router.post('/', saveCredentials);

export default router;