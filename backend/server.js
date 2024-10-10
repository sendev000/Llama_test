import express from 'express';
import routes from './routes/index.js';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { LLMAccessControl } from './events/contractEvent.js';

const app = express();

const server = http.createServer(app); // Assuming `app` is an Express instance or similar
const io = new SocketServer(server);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

const mongoURI = "mongodb://127.0.0.1:27017/db";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

app.use("/", routes);

const port = 5000;

server.listen(port, () => {
  LLMAccessControl;
  console.log(`Server listening on port ${port}`); 
});
