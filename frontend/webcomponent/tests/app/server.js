import dotenv from 'dotenv';
import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { joinRoom, handleWebhook } from './controllers/ videoRoomController.js';
import { createRoom, renderHomePage } from './controllers/homeController.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlewares
app.use(cors());

// Routes
app.get('/', renderHomePage);
app.post('/room', createRoom);
app.post('/join-room', joinRoom);
app.post('/webhook', (req, res) => {
	handleWebhook(req, res, io);
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`);
});
