// @ts-nocheck
import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import { MikroORM } from "@mikro-orm/core";
import { RequestContext } from "@mikro-orm/core";
import express from "express";
import rateLimit from "express-rate-limit";
import{randomString} from './rooms/commands/Utils'
import { LobbyRoom ,matchMaker} from "colyseus";
const cors = require('cors')
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  });

const logger = require("./helpers/logger");
import { connect, DI } from "./config/database.config";
import userRoutes from "./routes/userRoutes";
import characterRoutes from "./routes/characterRoutes";

import path from 'path';
import serveIndex from 'serve-index';
/**
 * Import your Room files
 */

import { TowerRoom } from "./rooms/TowerRoom";


export default Arena({
    getId: () => "Tower Online App",

    initializeGameServer: (gameServer) => {

        gameServer
        .define("lobby", LobbyRoom);

       gameServer.define("tower", TowerRoom)
        .enableRealtimeListing();
        /*
        gameServer.define("cardgame", CardGameRoom)
        .enableRealtimeListing();
*/



        for (var i = 1 ;i<=10;i++) {
            var options =  {
                username: "Jake",
              //  room_password:"54188",
                robots:14,
                idx:i,
                reconnect:true,
                eid:'tb',
                roomId:randomString(8),
                master:true       
                }
                matchMaker.createRoom("tower", options);
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
                res.send(200);//让options尝试请求快速结束else
            next();
        })


        /**
         * Bind your custom express routes here:
         */
        // Body parser - reads data from request body into json object
        app.use(express.json());
        app.use(express.urlencoded({ extended: true, limit: "5kb" }));
        app.use(cors());
        app.set('trust proxy', 1);

        //
        // MikroORM: it is important to create a RequestContext before registering routes that access the database.
        // See => https://mikro-orm.io/docs/identity-map/
        //
         app.use((req, res, next) => RequestContext.create(DI.orm.em, next));

        // Register routes for our simple user auth
        app.use("/users", userRoutes,apiLimiter);
        app.use("/characters", characterRoutes,apiLimiter);

        // Connect to our database
        connect().then(async () => {
            logger.silly(`*** Connected to Database! ***`);
        });

        app.get("/test", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))        
        app.use('/', express.static(path.join(__dirname, "static")));

       app.use('/game', serveIndex(path.join(__dirname, "public"), {'icons': true}))
        app.use('/game', express.static(path.join(__dirname, "public")));

        app.use('/admin', serveIndex(path.join(__dirname, "public/admin"), {'icons': true}))
        app.use('/admin', express.static(path.join(__dirname, "public/admin")));
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});