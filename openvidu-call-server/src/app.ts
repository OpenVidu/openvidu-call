
import express from 'express';
import { SERVER_PORT } from './config';

const app = express();

app.use(express.json());

app.listen(SERVER_PORT, () => {
    console.log(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
});