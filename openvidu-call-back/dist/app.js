"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = require("./config");
var CallController_1 = require("./controllers/CallController");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = express_1.default();
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use('/call', CallController_1.app);
app.listen(config_1.SERVER_PORT, function () {
    console.log("OpenVidu Call Server is listening on port " + config_1.SERVER_PORT);
});
