import { Room, Client ,ServerError ,Delayed,updateLobby,matchMaker } from "colyseus";
import { Dispatcher } from '@colyseus/command'
import {TowerRoomState, Progress } from "./schema/tower/TowerRoomState";
//import { RoleCard } from "./schema/tower/TowerRoomRoleCardState";
import { RoleCard } from "./schema/tower/TroubleRole";
import { RoleManager } from "./schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "./schema/tower/TowerRoomHandCardState";
import {Player } from "./schema/tower/TowerRoomPlayerState";

import { Seat, SeatManager } from "./schema/SeatState";
import { Nominate, NominateManager } from "./schema/NominateState";

import { User } from "../entities/UserEntity";
import { DI } from "../config/database.config";
const bcrypt = require ('bcrypt');

import { MagicBook } from "./schema/tower/TowerRoomMagicBook";
import {ActionManager,Action } from "./schema/tower/TowerRoomActionState";
import { Logger } from "@mikro-orm/core";
import { Preview } from "./schema/tower/TowerPreviewManager";

import {OnJoinCommand} from './commands/OnJoinCommand'
import {DoCreateRobot,DoAutoTakeSeat,SortSeat,DoAutoSeatReady,SendPreviewRole,DoAutoSelectRole,AddWishRole
,SetupRoleAndSeat,CleanTrash} from './commands/SetupCommand'

import{Reset,SetNightOrder,UseSkill,AsyncSequenceSkill} from './commands/ActionCommand'
import{CheckBuff} from './commands/BuffCommand'
import{Init,WishSetup,ReportAllWish,ReleasePoision,ReleaseBuff,CheckAllDemonBuff,ResetMagicBookEveryRound} from './commands/MagicBookCommand'
import{InitMessageManager,SetMessageCount,ShareInfo} from './commands/MessageCommand'
import{UpdateSeat} from './commands/UiCommand'
import{SetIcon,PlayerJoin} from './commands/PlayerCommand'
import{randomString} from './commands/Utils'
const logger = require("../helpers/logger");

const editions = require('./schema/tower/json/editions.json');
export class TowerRoom extends Room<TowerRoomState> {
    private dispatcher = new Dispatcher(this)
    firstUser: boolean = true    
    // this room supports only 4 clients connected
    name = 'tower';
    maxClients = 16;
    autoDispose = false; 
    systemTimeout: Delayed;
    systemInterval: Delayed;
    delayedInterval: Delayed;
    msgInterval: Delayed;
    lobbyTimeout :Delayed;
    onCreate (options: any) {

      console.log("onCreate options",options)
        // @ts-ignore
      let res=editions.filter((item,index,array)=>{            
        return (item.id  == options.eid)       
      }) 
      if (res.length!=1) return;
      //console.log(res[0])
      var edition = res[0]

        this.msgInterval = this.clock.setInterval(() => {
           // @ts-ignore
          this.dispatcher.dispatch(new SetMessageCount(), {});    
        }, 1000); 

        this.lobbyTimeout = this.clock.setInterval(() => {
          var date = this.state.magicBook.getDate();
          var idx = options.idx
          //logger.silly(" this.lobbyTimeout:"+date)
          this.setMetadata({
            date: date,
            name:edition.name,
            idx:idx
          }).then(() => updateLobby(this));    
        }, 2000);



        this.setState(new TowerRoomState());        
        this.state.init(options);        
        this.clock.start();
        //this.autoDispose = false;


        if (options["robots"]>0) {
        this.state.options.robots = options["robots"] 
        } 
        if (options["playerChooseCharacter"]==false) {
        this.state.options.playerChooseCharacter = false;
        }
        if (options["maxClients"]>0) {
        this.maxClients = options["maxClients"] 
        this.state.options.maxClients = options["maxClients"] 
        }
        if (options["lock"]==true) {  
          this.state.options.reconnect =  true;
      } 
        
      if (options["roomId"]>0) {  
          console.log(options["roomId"])
          this.roomId = String(options["roomId"]) 
          this.state.options.id =  String(options["roomId"]) 
          this.state.options.roomId = options["roomId"]
      } 
      if (options["eid"]) {           
        this.state.options.eid =  String(options["eid"]) 
      } 

        this.initOnMessage();


    }

    async onAuth (client:Client, options:any, request:any) {     
      logger.info("onAuth:" +client.sessionId)
      logger.info("onAuth options.password:" +options.password)
      logger.info("onAuth options.username:" +options.username)
      
      const userRepo = DI.em.fork().getRepository(User);
      // Check for a user with a pending sessionId that matches this client's sessionId
      let user: User = await userRepo.findOne({ username: options.username });
      let validPassword: boolean = await bcrypt.compare(options.password, user.password);
      if (!user || validPassword === false) {
        throw new ServerError(400,"Incorrect username or password");      
       // throw new Error("Incorrect username or password");         
      }
      if (user) {
        var max = 3000;
        if ( sec<= max) {
          console.log("sec:",sec)
          let timeLeft = Math.ceil((max -sec) / 1000);
          timeLeft = max/1000;  
        
        
          throw new ServerError(400,`Can't log in right now, try again in ${timeLeft} seconds!`);         
        }

        if (this.state.players.has(user.id)){
          var data = {"reason":"不能重复加入房间","activeRoomId":user.activeRoomId,"activeSessionId":user.activeSessionId}
          var str = JSON.stringify(data);        
          throw new ServerError(402,str);  
        }

        // A user with the pendingSessionId does exist  
        // Update user; clear their pending session Id and update their active session Id
        //如果玩家之前的游戏还没结束
        if (user.activeRoomId){
          //  console.log("user.activeSessionId",user.activeSessionId)            
            //console.log("user.activeRoomId",user.activeRoomId)
            const rooms = await matchMaker.query({ name: this.name});       
            let res=rooms.filter((item,index,array)=>{            
              return (item.roomId  == user.activeRoomId)      
            })           
            
            if (user.activeRoomId != this.roomId){
              if (res.length>0){
                var data = {"reason":"还有游戏没结束","activeRoomId":user.activeRoomId,"activeSessionId":user.activeSessionId}
                var str = JSON.stringify(data);
                throw new ServerError(401,str);  
              }
                
              else {
                logger.silly(user.activeRoomId+" not existed")    
              }    
            }


          
        } 

        user.activeSessionId = client.sessionId;
        user.activeRoomId = this.roomId;
        user.pendingSessionId = "";  
        var sec = Date.now() - user.pendingSessionTimestamp;
        user.pendingSessionId = client.sessionId;
        user.pendingSessionTimestamp = Date.now();
        user.updatedAt = new Date();
        await userRepo.flush();

      

        

       
       

       

        // Returning the user object equates to returning a "truthy" value that allows the onJoin function to continue

        return user;
      } else {      
        throw new ServerError(400, "Bad session!");
        
      }

      
    }
    adminJoin(client:Client){
      logger.info("adminJoin:" +client.sessionId)
      var player = new Player().assign({
        id: client.id,
        name :client.auth.username,
        admin : this.firstUser,
        robot :false
      });
      this.firstUser = false;
      var seatId = this.state.seatIdx.toString();

        this.state.adminId = client.auth.id;
        console.log("client.auth.id:", client.auth.id)
        this.state.magicBook.setAdmin(client.auth.id);
        var  player = new Player().assign({
            id:client.auth.id,
            name :client.auth.username,
            sessionId :  client.sessionId,
            admin : true,
            robot : false
          });
          this.state.players.set(player.id,player);      
          this.state.players.get(player.id).connected = true; 
         // this.resumeAllTimer();

        // client.send("onJoin", player); 
      this.runProgress(10,"");
    }
    playerJoin(client:Client){
       // @ts-ignore
      this.dispatcher.dispatch(new PlayerJoin(), {client}); 
      if (this.firstUser){
        this.firstUser = false;
        this.runProgress(10,"");
      }
      
    }

    onJoin (client: Client, options:any) {
    
      logger.info("onJoin options:" +options.username)
      logger.info("onJoin options:" +options.password)
      logger.info("onJoin options:" +options.roomId)
      logger.info("onJoin: this.roomId  " +this.roomId)

      logger.info("onJoin:" +client.sessionId)
       // @ts-ignore
      this.dispatcher.dispatch(new OnJoinCommand(), {       
        sessionId: client.sessionId,
        aid :client.auth.id
      });
    
      var pid = this.state.progress.pid;    
      /* 
      if (this.firstUser){
        this.adminJoin(client)        
      } else {
        this.playerJoin(client)
      }
      */

     
      this.playerJoin(client)

    }
    
    
  
    async onLeave (client: Client, consented?: boolean) {
      logger.silly(client.sessionId+ "断线了"+  consented ); 
      this.state.dropPlayer(client.auth.id)
                     
      try {     
          
          if (consented) {   
                         
            throw new ServerError(400,"手动断线了");  
                     
          } else{
          
            logger.warn(client.sessionId+ "等待重连中")          
        
            var oldClientId = client.sessionId;
            var  newClient = await this.allowReconnection(client, 600);   
            
            logger.warn(newClient.sessionId+ " reconnected!")                 
 
            this.state.alllowPlayer(newClient.auth.id)
           
          }
          
          

          
         // this.resumeAllTimer();     
      }       
      catch (e) {       
      
        this.state.deletePlayer(client.auth.id)
          console.log(e);
      }
    }

   valid(sessionId:string):boolean{
      
      if (sessionId) {
        var seat = this.state.magicBook.seatManager.getSeatBySessionId(sessionId);
        if (!seat) return;


        var sec = Date.now() - seat.pendingSessionTimestamp;
        seat.pendingSessionTimestamp = Date.now()
   
        var max = 1000;
        if ( sec<= max) {

          logger.silly("太快了sec:"+sec)
          let timeLeft = Math.ceil((max -sec) / 1000);
          timeLeft = max/1000;    
         
          return false           
        }
      }
      return true;
    }
    
    onDispose () {
      this.dispatcher.stop()
    }

  //每次pid变化时调用
  timerInfo(){  
     // this.broadcast("messages", {action:'timer',data:this.state.progress});
  }
  clientInfo(kind:string){
   
  
        this.broadcast("messages", {action:kind,data:{}});


   // logger.silly("******************  " +kind +"  ******************")
  
  }

    runProgress(pid:number,option:any) {  
        this.clearTimer();
        var progress:Progress = this.getProgress(pid);  
      
        if (!progress) return; 
        this.state.pid = pid;
        this.state.progress =progress;
        this.state.progress.leftTimeout =progress.timeout; 
        this.state.progress.name =progress.name; 
        
        this.state.progress.tip =progress.tip || ""; 
        
        this.progressChanged();

        logger.silly(progress.title());

        this.timerInfo();
      // 設置間隔計時並保存其引用
      // 以便後續清理工作
      var  delay = progress.timeout;
      this.state.serverTimeout = delay;
      
           // n 秒過後清理計時器;
      if (progress.func){
        if (delay>0){

          //this.systemTimeout =this.clock.setTimeout(() => {
          this.systemTimeout= this.clock.setTimeout(() => {
          //  this.systemTimeout.clear();
            this.systemInterval.clear();
            this.doFunction(progress.func,option)  
          }, delay*1000);          
          this.systemInterval = this.clock.setInterval(() => {
              delay --;
              this.state.serverTimeout = delay;
            //  this.state.progress.leftTimeout --;            
               if (delay<10)   
                  logger.warn("系统倒计时:"+delay)
          }, 1000); 
        } else {
          this.doFunction(progress.func,option) 
        }         
       }

  
    }

    doNothing(){}

    setProgress(n:number):Progress{
       var progress:Progress = this.getProgress(n);
       this.runProgress(n,'')
      return progress

    }
    getProgress(n:number):Progress{

      var str = String(n);
      var progress:Progress = this.state.pids.get(str)
        return progress

    }


    doFunction(func:string,delay:number){
      this.clientInfo(func);
      switch(func){
        case "enterRoom": this.enterRoom(); break;
        case "resetAll": this.resetAll(); break;
        case "doCreateSeats": this.doCreateSeats(); break;
        case "doCreateRobot": this.doCreateRobot(); break;
        case "checkIfStart": this.checkIfStart(); break;
        case "lockRoom": this.lockRoom(); break;
        case "doAutoTakeSeat": this.doAutoTakeSeat(); break;
        case "waitAdminStart": this.waitAdminStart(); break;
        case "doAutoSeatReady": this.doAutoSeatReady(); break;
        case "sendPreviewRole": this.sendPreviewRole(); break;
        case "doAutoLockRoom": this.doAutoLockRoom(); break;
        case "doAutoSelectRole": this.doAutoSelectRole(); break;
        case "setMagicBook": this.setMagicBook(); break;
        case "setRoleSkill": this.setRoleSkill(); break;
        case "cleanTrash": this.cleanTrash(); break;
        case "sendRole": this.sendRole(); break;
        case "shareInfo": this.shareInfo(); break;
        case "setupDayAndNight": this.setupDayAndNight(); break;
        case "gameStart": this.gameStart(); break;
        case "nextRound": this.nextRound(); break;
        case "waitNightAction": this.waitNightAction(); break;
        case "autoNightAction": this.autoNightAction(); break;
       // case "waitNightEtraAction": this.waitNightEtraAction(); break;
        case "waitDayAction": this.waitDayAction(); break;
        case "dayPublicChatOver": this.dayPublicChatOver(); break;
        case "waitDuskAction": this.waitDuskAction(); break;
        case "countVote": this.countVote(); break;
        case "execute": this.execute(); break;
        case "closeVote": this.closeVote(); break;
        case "doAutoGameOverAction": this.doAutoGameOverAction(); break;
        case "doAutoReportScore": this.doAutoReportScore(); break;
        case "doAutoRestart": this.doAutoRestart(); break;
        case "dayPublicChatOver": this.dayPublicChatOver(); break;
        case "waitDayAction": this.waitDayAction(); break;
        case "duskActionOver": this.duskActionOver(); break;
        case "waitVoteAction": this.waitVoteAction(); break;
        case "runAutoNightNewAction": this.runAutoNightNewAction(); break;
        case "makeNewBoss": this.makeNewBoss(); break;
        default :
          console.warn(func+" no function executed")
        break;

      }
    }
    //10
    enterRoom(){
     
      this.runProgress(11,"");
    }
    //11
    resetAll(){
      
        this.state.magicBook = new MagicBook();
        this.unlock();
        this.state.start = false;
        this.state.gameOver = false;            
        this.resetPlayers();
        this.setRoleManager({id:this.state.options.eid}); 
        this.setHandCardDeck({id:this.state.options.eid});    
        this.state.magicBook.adminId = this.state.adminId;       
        this.state.pause = false;
        this.setProgress(12);   
        return;
       // this.dispatcher.dispatch(new AsyncSequenceSkill(), {});    
      }

   
    //12
    doCreateSeats(){
        
        let book = this.state.magicBook;
        book.seatManager.addEmptySeats(this.state.maxSeats);       
        this.seatReseted();      


       
        if (this.state.options.robots>0)
           this.runProgress(13,'');
        else 
           this.runProgress(15,'');
        return;
      

       this.seatReseted();
  
      }
          //13
      doCreateRobot(){
         // @ts-ignore
        this.dispatcher.dispatch(new DoCreateRobot(), {});        
         this.runProgress(15,"")
      }
  
  

    //15
    checkIfStart(){
        this.state.enableReconnect = true;
        this.runProgress(16,"")
     }
     //16
     lockRoom(){      
        this.lock();
        this.runProgress(20,"");
     }    
     //20
     doAutoTakeSeat(){
        /*
        if ( this.state.magicBook.seatManager.lock) {
          this.runProgress(21,"");   
          return;
        }
        */
        // @ts-ignore
        this.dispatcher.dispatch(new DoAutoTakeSeat(), { });
        this.state.magicBook.seatManager.lock = true;
        this.seatChanged();
        this.runProgress(21,"");   
      
     }    
     seatChanged(){
      this.state.seatChanged = new Date().getTime();
     }
     seatReseted(){
      this.state.seatReseted = new Date().getTime();
     }     
     progressChanged(){
      this.state.progressChanged = new Date().getTime();
     }

    resetPlayers(){
      this.state.players.forEach((player:Player) => {  
          player.reset();
          
      }); 
    }    
    takeSeat(player:Player,seatId:string){     
      if (!seatId) return;
      var _seatId = String(seatId)
      let book = this.state.magicBook;
      book.seatManager.takeSeat(player,seatId);



    }

  //21
    waitAdminStart(){
        this.state.start = true;
      /*
       let book =  this.state.magicBook;
       let seatManager = book.seatManager;
       seatManager.sort();
       */
       // @ts-ignore
       this.dispatcher.dispatch(new SortSeat(), { });


       this.seatReseted();

     this.runProgress(22,"");   
    }

     //22
    doAutoSeatReady(){
      /*
      this.state.magicBook.seatManager.lock = true;
      this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {    
          if (seat.locked){
            seat.ready = true;
          }      
         
      })  
      this.state.magicBook.seatManager.setSeat();
      */
      this.state.playerCount =  this.state.magicBook.seatManager.seats.size;
      logger.silly(" this.state.playerCount:"+ this.state.playerCount)
       // @ts-ignore
      this.dispatcher.dispatch(new DoAutoSeatReady(), { });
      
   

      this.runProgress(23,"");
    }
    
     //23
     sendPreviewRole(){
       // @ts-ignore
      this.dispatcher.dispatch(new SendPreviewRole(), { });


      this.runProgress(24,"")
    }
    //24
    doAutoLockRoom(){
      this.state.lockRoom = true;
      this.runProgress(25,"");
    }

    selectPreviewRole(seatId:string,roleId:string):boolean{
     
      console.log("selectPreviewRole:",seatId ,":",roleId)
      if (!seatId) return;
      if (!roleId) return;

      var preview:Preview = this.state.magicBook.previewManager.previews.get(seatId)
      if (!preview) return;

      if (!preview.previewRoleCards.has(roleId)) return;

      var _card = preview.previewRoleCards.get(roleId);
      if (!_card) return;

     preview.pickRoleCard.clear();
     preview.pickRoleCard.set(_card.id,_card);  
 
     return true;
    }


    //25
    doAutoSelectRole() {    
       // @ts-ignore
      this.dispatcher.dispatch(new DoAutoSelectRole(), { });
    

      
     this.runProgress(26,"");
    } 
    //26
    setMagicBook(){
        let book = this.state.magicBook;
      
        // @ts-ignore
        this.dispatcher.dispatch(new AddWishRole(), { }); // @ts-ignore

        this.dispatcher.dispatch(new Init(), {}); // @ts-ignore
        this.dispatcher.dispatch(new WishSetup(), {});      // @ts-ignore
        this.dispatcher.dispatch(new ReportAllWish(), {});      // @ts-ignore
            

        book.reportAllPlace();
        var sessionId ="123";
         // @ts-ignore
        this.dispatcher.dispatch(new InitMessageManager(), {sessionId});  
       // this.state.magicBook.initMessageManager();
        this.state.magicBook.addMessage(this.state.magicBook.report);
        this.runProgress(27,"")
    }

  

    clearTimer(){
        if (this.systemTimeout) {
          this.systemTimeout.clear();
        }
        if (this.systemInterval) {
          this.systemInterval.clear();
        }
  
      }



    setRoleSessionIdBySeatId(seatId:string,sessionId:string):boolean{
      var roleManager:RoleManager =   this.state.magicBook.roleManager;
      var seatManager:SeatManager =   this.state.magicBook.seatManager;   
      var seat = seatManager.seats.get(seatId);
      if (!seat) return;
      var role = roleManager.getRoleBySeatId(seatId);
      if (!role) return;
      role.sessionId = seat.sessionId;
      roleManager.roles.set(role.id,role);
      
      return true;
    }


    // role card
    setRoleManager(option:any){
        var roleManager = new RoleManager();
        this.state.magicBook.roleManager = roleManager;
        this.state.magicBook.roleManager.init(option);        
        
      }    
      
      setHandCardDeck(option:any){
        var handCardDeck = new HandCardDeck();
        this.state.handCardDeck = handCardDeck;
        handCardDeck.init(option);
      }
        
      //27
      setRoleSkill(){
      
        this.runProgress(28,"")
      }
      //28 
      cleanTrash(){
         // @ts-ignore
        this.dispatcher.dispatch(new CleanTrash(), { });
        this.runProgress(29,"")
      }
      //29
      sendRole(){
      //  this.setRolesSessionIdBySeat();
       // @ts-ignore
        this.dispatcher.dispatch(new SetupRoleAndSeat(), { });
       
       this.runProgress(30,"");
      } 
  
      setupDayAndNight(){
  
  
        this.runProgress(31,"");
      }
      
      //31
      shareInfo(){
         // @ts-ignore
        this.dispatcher.dispatch(new ShareInfo(), { }); 
        this.runProgress(40,"");
      }

      //40
      gameStart(){    
        this.state.magicBook.round  =0;
        this.state.magicBook.initMessage();
      this.runProgress(41,"")
     //  this.runProgress(10,"")
      }  


    //41
    nextRound(){
     
      let book =  this.state.magicBook;

     
      
      book.nextRound();
      book.reportDate();
      book.setLuck(); // @ts-ignore

      this.dispatcher.dispatch(new ResetMagicBookEveryRound(), {}); // @ts-ignore
      
      this.dispatcher.dispatch(new ReleasePoision(), { }); // @ts-ignore
      this.dispatcher.dispatch(new ReleaseBuff(), { }); // @ts-ignore
      this.dispatcher.dispatch(new UpdateSeat(), { }); // @ts-ignore
    
      
      if (book.isDay()){   
        this.state.duskDelayLeft = this.state.duskDelay;
        var delay = this.state.dayDelay
        this.waitAction(60,delay)
      }else {
        var delay = this.state.nightDelay
        this.waitAction(50,delay)
      }
     
      
    }

    //50
    waitNightAction(){     

      this.autoNightAction();
    }

    waitAction(pid:number,timeout:number){     
      this.clearTimer();
      var progress:Progress = this.getProgress(pid);        
      if (!progress) return; 
      this.state.pid = pid;
      this.state.progress =progress;
      this.state.progress.leftTimeout =progress.timeout; 
      this.state.progress.name =progress.name; 

      var delay = progress.timeout;
      if (timeout>0)
       delay = timeout;      

      logger.silly(progress.title());
      this.state.progress.tip =progress.tip || ""; 
      
      this.progressChanged();      


     // var  delay =  this.state.dayDelay;
      this.state.serverTimeout = delay;
      this.systemTimeout =this.clock.setTimeout(() => {
        this.systemInterval.clear();
        this.systemTimeout.clear();      
        this.doFunction(progress.func,delay)
      }, delay*1000);
      
      this.systemInterval = this.clock.setInterval(() => {
           delay --;
           this.state.serverTimeout = delay;        
      
          logger.warn(progress.name+"倒计时:"+delay)
      }, 1000);   


    }

    //60
    waitDayAction(){     
    
      var delay = this.state.duskDelayLeft
      this.waitAction(62,delay)


    }
    //61
    dayPublicChatOver(){     

    }
  
    //62
    waitDuskAction(){     
      this.waitAction(64,3) //3秒後结算投票结果        
    }

    
    async autoNightAction(){

     // @ts-ignore
      await  this.dispatcher.dispatch(new Reset(), {});
       // @ts-ignore
      await  this.dispatcher.dispatch(new SetNightOrder(), {});
      await  this.dispatcher.dispatch(new AsyncSequenceSkill(), {});
       // @ts-ignore
      await  this.dispatcher.dispatch(new CheckAllDemonBuff(), {});
  
     // this.nightDelay(1,"checkNewAction")  
      this.checkNewAction()
    }
    /**
     *处理 : 晚上全部玩家行动后，产生的新action 
     */
    
    checkNewAction(){
      this.setProgress(53)

      let size =this.state.magicBook.actionManager.actions.size
      console.log("checkNewAction:" ,size)
      
      if (size>0){
          logger.silly("等待玩家回应")
          this.waitAction(54,20)   // 54,等待玩家回应,runAutoNightNewAction
      } else {       
        this.checkGameOver(41);
      }       
        

    }
    
    runAutoNightNewAction(){
      logger.silly("自动执行命令")
      
      let book = this.state.magicBook
      let actionManager =book.actionManager
      let size = actionManager.actions.size 
      if (size>0)
        this.autoSelectTargetAndRun();
      else 
        this.runProgress(41,"");
    }

    autoSelectTargetAndRun(){
      let book = this.state.magicBook
      let actionManager =book.actionManager
      /*

      actionManager.actions.forEach((action:Action) => {  
        if (action.done==false){
          
          var role = book.roleManager.roles.get(action.id);
          if (role){
             if (!role.used) return;
            var targetRole:RoleCard = book.roleManager.getOneRandomRole([action.id],null,true,true);
            action.targets.push(targetRole.seatId);
            actionManager.actions.set(action.id,action);          
            role.doAutoFunction(role.id,book);
          }
          
          
        }
      }); 
      */
      actionManager.actions.clear();
      this.runProgress(41,"");    

    }    
    //63
    waitVoteAction(){
     // this.voteActionOver();
      var leftSec = this.state.duskDelayLeft;
      this.waitAction(62,leftSec)
    }
    //60



    
    duskActionOver(){
      this.runProgress(64,"");
      
    }
    voteActionOver(){
      let book =  this.state.magicBook
     // console.log(book.round);
      book.addMessage(book.getDate()+"此轮投票结束(" +book.round+")")
      //this.checkGameOver(41);
      this.startSystemTimer();
    }

    //61
    nominateAction(){

    }

    playerVote(player:Player){     
      let nominateManager =  this.state.magicBook.nominateManager;            
      nominateManager.playerVote(player.seatId,1);
      console.log("感谢你的投票")
    }
    playerRemoveVote(player:Player){     
      let nominateManager =  this.state.magicBook.nominateManager;            
      nominateManager.playerRemoveVote(player.seatId);
      console.log("撤票了")
    }
    //61
    startNominate(seatId:string,starterSeatId:string){
      console.log("this.state.serverTimeout:",this.state.serverTimeout)
      this.state.duskDelayLeft = this.state.serverTimeout;
      
      let book =   this.state.magicBook
      let nominateManager =book.nominateManager;

      var starter:RoleCard = this.state.magicBook.getRole(starterSeatId);
      if (!starter) return;
      var target:RoleCard = this.state.magicBook.getRole(seatId);
      if (!target) return;
      if (target.isVirgin){

        var _target:RoleCard = target.changeRoleSkill(book);
        console.log("starter:"+starter.title())
        if (starter.isTownsfolk()){
          book.addMessage(starter.seat()+"因为提名"+target.seat()+"被处死了");
          book.executePlayer(target,starter);
          target.isVirgin = false;
          book.roleManager.roles.set(target.id,target);
          this.stopSystemTimer();
          this.checkGameOver(41);

        }
         return
        
      }

      var msg = nominateManager.startNominate(target,starter);   
      if (msg){
        book.addMessage(msg);
       
        this.stopSystemTimer();
        
        var delay = this.state.voteDelay;
        this.waitAction(63,delay);
      } else {
        console.error("criticl error")
      }
      
     
    }
    stopSystemTimer(){
     
      this.pauseAllTimer();
    }
    startSystemTimer(){
      
      this.resumeAllTimer();
    }
    pauseAllTimer(){
      if (this.systemTimeout) 
      this.systemTimeout.pause();
      if (this.systemInterval) 
      this.systemInterval.pause();
      this.clock.stop();
      this.state.pause = true;
    }
    resumeAllTimer(){  

      if (this.systemTimeout) 
      this.systemTimeout.resume();
      if (this.systemInterval) 
      this.systemInterval.resume();
      this.clock.start();
      this.state.pause = false;
    }



    //64
    countVote(){
      this.runProgress(67,"")
    }
    
    //67
    execute(){
      let book = this.state.magicBook;   
      let nominateManager =  this.state.magicBook.nominateManager;   
      var alive =  this.state.magicBook.getAlive();  
      var nominate:Nominate =  nominateManager.countVote(alive)
      if (nominate){
        var role:RoleCard = book.getRole(nominate.targetSeatId)
      
        book.execute(nominate)
        book.addMessage(book.getDate()+role.title()+"被处决")
      } else {

        book.addMessage("没人被处决<平安日>")
      }      
      this.runProgress(68,"");
    }


    //68
    closeVote(){
      
      let nominateManager =  this.state.magicBook.nominateManager;
      var nominate:Nominate = nominateManager.votes.get(nominateManager.voting);
      if (nominate) {
        nominate.closed = true;
        nominateManager.nominates.set(nominate.id,nominate);
        nominateManager.votes.delete(nominate.id);
      }
      nominateManager.voting = null;
      this.checkGameOver(41)
    }
    //100
    makeNewBoss(){
      let book = this.state.magicBook;
      book.makeNewBoss();
    }

    checkGameOver(run_pid_if_not_over:number){
      this.setProgress(999)
     // logger.silly("结算是否结束,否则就:"+run_pid_if_not_over)
      var result = false;  
      result = this.state.magicBook.checkGameOver();
        
      console.log("result ",result)  
      if (this.state.magicBook.round >=this.state.magicBook.maxRound)
        result = true;
      if (result == false){
        if (run_pid_if_not_over!=0)
          this.runProgress(run_pid_if_not_over,'');
      } else {
        this.claimWin();
      }

    }
    claimWin(){
      this.state.gameOver = true;
  

      console.log('**************************************************************************')
      console.log('******************************** Game Over *******************************')
      console.log('**************************************************************************')
 
      this.runProgress(910,'')
     
    }

    //910
    doAutoGameOverAction(){
      console.log("doAutoGameOverAction")    
      this.runProgress(911,'');
    }
    //911
    doAutoReportScore(){
      console.log("doAutoReportScore")
     
      this.runProgress(912,'');

    }
    //912
    doAutoRestart(){
      console.log("doAutoRestart")      
      this.state.gameOver =false;
      this.runProgress(10,'');
    }
    
    initOnMessage(){
          //from client  room.send("action",{'action':'select','target':'3'});
          //from client  room.send("action",{'action':'nominate','target':'4'});
          //from client  room.send("action",{'action':'resetAll'});
          //from client  room.send("action",{'action':'selectRole','cardId':'monk'});

              this.onMessage("action", (client, message) => {
                console.log("onMessage:",message)
                if (this.state.gameOver )      return ;

                if (this.state.adminId == client.auth.id){
                  this.adminCommand(client,message)
                } else {
                  this.playerCommand(client,message);
                }            

              
              });  

          // when receiving updatePlayer message, call the PlayerUpdateCommand
          this.onMessage(
          "playerAction",
            (client, message: { x: number; y: number; anim: string }) => {
               // @ts-ignore
              this.dispatcher.dispatch(new PlayerUpdateCommand(), {
                client,
                x: message.x,
                y: message.y,
                anim: message.anim,
              })
            }
          )




    }



    adminCommand(client:Client, message:any){
      let book = this.state.magicBook;
      let seatManager:SeatManager = book.seatManager;
      let nominateManager :NominateManager  =book.nominateManager;
      var action = message.action ;
      var player = this.state.players.get(client.auth.id);
      var seatId = message.seatId;
/*
      switch (message.action) {          
              
        case 'slayerTest':
          //if (!message.seatId) return;
       
          if (this.state.progress.pid<60) return;
          if (this.state.progress.pid>70) return;
        
          var role = book.getRoleById('slayer');
          var demonRole =  book.getRoleById('imp');
          if (!demonRole.alive) return;
          var targets =[demonRole.seatId]
          console.log("slayerTest",targets);
          var act = new Action().assign({
            id: role.id,
            seatId: role.seatId,
            targets:targets,                  
            round :book.round                  
          });
          book.actionManager.actions.set(act.id,act)
           
          role.autoUseSkill(book);
        break; 
          
        case 'saintTest':
          if (this.state.progress.pid !=62) return;
          var target:RoleCard =  book.getRoleById('saint');
          var starter:RoleCard =  book.getOneRandomRole([],"",true,true);
        
          if (nominateManager.checkNominate(target.seatId,player.seatId,book.round) == false) return;                  
          this.startNominate(target.seatId,starter.seatId)
        break; 

        case 'virginTest':
          if (this.state.progress.pid !=62) return;
          var target:RoleCard =  book.getRoleById('virgin');
          var starter:RoleCard =  book.getOneRandomRole([],"",true,true);        
          if (nominateManager.checkNominate(target.seatId,player.seatId,book.round) == false) return;                  
          this.startNominate(target.seatId,starter.seatId)
        break;                   
              
            
        case 'resetAll':
            //if (this.state.pid<25) return;
            this.clearTimer();
            this.runProgress(10,"");
            break;                         
        case 'takeSeat':
            //console.log(player.id)
            this.takeSeat(player,message.seatId); 
            break;                         
        case 'changeSeat':
            this.state.changeSeat(message.a,message.b);
            break;    
        case 'pause':
          this.pauseAllTimer();
          break;
        case 'resume':
          this.resumeAllTimer();
          break;                     
                  
      }
      */
    


    }

    playerCommand(client:Client, message:any){
      console.log("playerCommand",message)
      let book = this.state.magicBook;
      let seatManager:SeatManager = book.seatManager;
      let nominateManager :NominateManager  =book.nominateManager;
      
      var player = this.state.players.get(client.auth.id);
      var seatId = message.seatId;
      var pid = this.state.progress.pid;

      if (!player) {
          logger.error("没有这个玩家")
          return;
      }

        var seat =  seatManager.getSeatByPlayerId(player.id)
        if (!seat) {
          if (pid !=15){
            logger.error("玩家没有座位")     
            return;
          }
           
        } else {
            player.seatId = seat.id;
            this.state.players.set(player.id,player);
            logger.silly(player.name+"的座位是"+ seat.id);
        }   



        switch (message.action) {
              
          case 'select':
              console.log(message);    
              break;                 
          case 'vote':
              
              if (this.state.progress.pid !=63) return;   
              if (!nominateManager.voting) {
                console.error("no voting number")
                return;    
              } else   this.playerVote(player)
              break;  
          case 'removeVote':
            if (this.state.progress.pid !=62) return;   
            if (nominateManager.voting) return;    
            this.playerRemoveVote(player)
            break;                                    
              
          case 'startNominate':
             if (this.state.pid !=62) return;
              var seatId = message.data.targets[0];
              //seatId =String(seatId)
              if (Number.parseInt(seatId) <=0) return;
              console.log("seatId",seatId)
              if (!seatId) return;

             
            

              if (nominateManager.checkNominate(seatId,player.seatId,book.round) == false) return;                  
              this.startNominate(seatId,player.seatId)
              break;                              
          case 'takeSeat':
       
              if (pid==15)
                 this.takeSeat(player,message.seatId); 
              break;     
 
          case 'playerChangeSeat':
            var seatId = message.data.targets[0];
            //seatId =String(seatId)
            if (Number.parseInt(seatId) <=0) return;
            console.log("seatId",seatId)
            if (!seatId) return;

           if ( seatManager.playerChangeSeat(player,seatId)){
             this.seatChanged();
              console.log("playerChangeSeat true")  
            } else {

              logger.silly(" seatManager.playerChangeSeat faliure")
            }
            /*
            var a = book.seatManager.getSeatByPlayerId(player.id);
            var b = book.seatManager.seats.get(message.seatId);
            console.log("playerChangeSeat a",a.idx)
            console.log("playerChangeSeat b",b.idx)
            */
            break;
            
          case 'selectPreviewRole':
              console.log(client.sessionId,message.data)
            var result = this.selectPreviewRole(player.seatId,message.data.roleId)
            console.log("result",result)
            break;
            
            case 'nightAbility':
              if (pid==50){
                console.log(client.sessionId,message.data)

                //todo: valid data.targets
                var result = this.state.magicBook.roleManager.setRoleTargets(client.sessionId,message.data.targets)
                console.log("result",result)
              }
            break;

            case 'setIcon':
              logger.silly(" setIcon startring.......")
              if (pid>15){
                //player ,seatId,iconSeatId,roleId
                console.log(client.sessionId,message.data)
                var seatId = player.seatId;
                var iconSeatId =message.data.iconSeatId;
                var roleId =message.data.roleId;
                var team = message.data.team
                // @ts-ignore
                this.dispatcher.dispatch(new SetIcon(), {seatId,iconSeatId,roleId,team});    

              }
            break;            

          case 'systemTimeOut':
              this.state.systemTimeout =  this.state.progress.timeout - Math.ceil(this.systemTimeout.elapsedTime/1000);
              break;                         
        }

      
    }

   

  }
