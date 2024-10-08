import express from 'express';
import routes from './routes/index.js';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use("/", routes);

const port = 5000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);  
});