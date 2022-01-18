import { Router } from 'express';
import * as user from '../controllers/userController.js';

const router = Router();

router.post('/signup', user.signUp);
router.post('/login', user.signIn);
router.post('/logout', user.logout);

router.use(user.protect);

router.patch('/', user.addToCart);
router.post('/add-to-history', user.addToHistory);
router.patch('/delete-from-cart', user.deleteItemFromCart);
router.patch('/modify-cart-count', user.modifyCartCount);
router.patch('/modify-cart-completed', user.modifyCartCompleted);

export default router;
