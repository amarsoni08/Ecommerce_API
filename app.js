import express from 'express';
import 'dotenv/config';
import connectDB from './config/mongodb/mongodb.js';
import cors from 'cors';
import adminRouter from './routes/adminRoute/adminRoute.js';
import userRouter from './routes/userRoute/userRoute.js';
import productRouter from './routes/productRoute/productRoute.js';
import orderRouter from './routes/orderRoute/orderRoute.js';
const app = express();
connectDB();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
    res.send('E-commerce Server is running!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});