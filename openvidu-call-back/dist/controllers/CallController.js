"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var OpenViduService_1 = require("../services/OpenViduService");
var config_1 = require("../config");
exports.app = express_1.default.Router({
    strict: true
});
var openviduService = new OpenViduService_1.OpenViduService();
exports.app.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, sessionResponse, error_1, statusCode, response, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sessionId = req.body.sessionId;
                console.log('Session ID received', req.body);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, openviduService.createSession(sessionId, config_1.OPENVIDU_URL, config_1.OPENVIDU_SECRET)];
            case 2:
                sessionResponse = _b.sent();
                sessionId = sessionResponse.id;
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                statusCode = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status;
                if (statusCode && statusCode !== 409) {
                    handleError(error_1, res);
                    return [2 /*return*/];
                }
                return [3 /*break*/, 4];
            case 4:
                _b.trys.push([4, 6, , 7]);
                return [4 /*yield*/, openviduService.createToken(sessionId, config_1.OPENVIDU_URL, config_1.OPENVIDU_SECRET)];
            case 5:
                response = _b.sent();
                res.status(200).send(JSON.stringify(response.token));
                return [3 /*break*/, 7];
            case 6:
                error_2 = _b.sent();
                handleError(error_2, res);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
function handleError(error, res) {
    var _a;
    var statusCode = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status;
    if (error.code === 'ECONNREFUSED') {
        console.error('ERROR: Cannot connect with OpenVidu Server');
        res.status(504).send('ECONNREFUSED: Cannot connect with OpenVidu Server');
        return;
    }
    if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || error.code.includes('SELF_SIGNED_CERT')) {
        res.status(401).send('ERROR: Self signed certificate Visit ' + config_1.OPENVIDU_URL);
        return;
    }
    res.status(statusCode).send('ERROR: Cannot create OpenVidu session');
}
