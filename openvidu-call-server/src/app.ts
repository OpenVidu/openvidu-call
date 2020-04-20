
import express from 'express';
import { SERVER_PORT } from './config';
import {app as callController} from './controllers/CallController';

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.use('/call', callController);

app.listen(SERVER_PORT, () => {
    console.log(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
});