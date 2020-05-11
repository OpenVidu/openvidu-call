
import * as express from 'express';
import { SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET, CALL_OPENVIDU_CERTTYPE } from './config';
import {app as callController} from './controllers/CallController';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();


app.use(express.static('public'));
app.use(express.json());

app.use('/call', callController);

app.listen(SERVER_PORT, () => {
    console.log("---------------------------------------------------------");
    console.log(" ")
    console.log(`OPENVIDU URL: ${OPENVIDU_URL}`);
    console.log(`OPENVIDU SECRET: ${OPENVIDU_SECRET}`);
    console.log(`CALL OPENVIDU CERTTYPE: ${CALL_OPENVIDU_CERTTYPE}`);
    console.log(`OpenVidu Call Server is listening on port ${SERVER_PORT}`);
    console.log(" ")
    console.log("---------------------------------------------------------");
});