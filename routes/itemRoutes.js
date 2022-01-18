import { Router } from 'express';
import * as item from '../controllers/itemController.js';
import { protect } from '../controllers/userController.js';
import upload from '../utils/multer.js';

const router = Router();

router.use(protect);

router.get('/', item.getItems);
router.get('/:id', item.getItem);
router.post('/', upload.single('image'), item.addItem);

export default router;
