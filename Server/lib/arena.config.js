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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Utils_1 = require("./rooms/commands/Utils");
const colyseus_1 = require("colyseus");
const cors = require('cors');
const apiLimiter = express_rate_limit_1.default({
    windowMs: 15 * 60 * 1000,
    max: 100
});
const logger = require("./helpers/logger");
const database_config_1 = require("./config/database.config");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const characterRoutes_1 = __importDefault(require("./routes/characterRoutes"));
const path_1 = __importDefault(require("path"));
const serve_index_1 = __importDefault(require("serve-index"));
/**
 * Import your Room files
 */
const TowerRoom_1 = require("./rooms/TowerRoom");
exports.default = arena_1.default({
    getId: () => "Tower Online App",
    initializeGameServer: (gameServer) => {
        gameServer
            .define("lobby", colyseus_1.LobbyRoom);
        gameServer.define("tower", TowerRoom_1.TowerRoom)
            .enableRealtimeListing();
        /*
        gameServer.define("cardgame", CardGameRoom)
        .enableRealtimeListing();
*/
        for (var i = 1; i <= 10; i++) {
            var options = {
                username: "Jake",
                //  room_password:"54188",
                robots: 14,
                idx: i,
                reconnect: true,
                eid: 'tb',
                roomId: Utils_1.randomString(8),
                master: true
            };
            colyseus_1.matchMaker.createRoom("tower", options);
        }
    },
    initializeExpress: (app) => {
        app.all("*", function (req, res, next) {
            //设置允许跨域的域名，*代表允许任意域名跨域
            res.header("Access-Control-Allow-Origin", "*");
            //允许的header类型
            res.header("Access-Contro1-Allow-Headers", "content-type");
            //跨域允许的请求方式
            res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
            if (req.method.toLowerCase() == 'options ')
                res.send(200); //让options尝试请求快速结束else
            next();
        });
        /**
         * Bind your custom express routes here:
         */
        // Body parser - reads data from request body into json object
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true, limit: "50kb" }));
        app.use(cors());
        app.set('trust proxy', 1);
        //
        // MikroORM: it is important to create a RequestContext before registering routes that access the database.
        // See => https://mikro-orm.io/docs/identity-map/
        //
        app.use((req, res, next) => core_1.RequestContext.create(database_config_1.DI.orm.em, next));
        // Register routes for our simple user auth
        app.use("/users", userRoutes_1.default, apiLimiter);
        app.use("/characters", characterRoutes_1.default, apiLimiter);
        // Connect to our database
        database_config_1.connect().then(() => __awaiter(void 0, void 0, void 0, function* () {
            logger.silly(`*** Connected to Database! ***`);
        }));
        app.get("/test", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        app.use('/', serve_index_1.default(path_1.default.join(__dirname, "static"), { 'icons': true }));
        app.use('/', express_1.default.static(path_1.default.join(__dirname, "static")));
        app.use('/game', serve_index_1.default(path_1.default.join(__dirname, "public"), { 'icons': true }));
        app.use('/game', express_1.default.static(path_1.default.join(__dirname, "public")));
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor_1.monitor());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
