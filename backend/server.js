import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
