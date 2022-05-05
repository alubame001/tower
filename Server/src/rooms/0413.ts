import { Room, Client ,ServerError ,Delayed} from "colyseus";
import {TowerRoomState, Progress } from "./schema/tower/TowerRoomState";
//import { RoleCard } from "./schema/tower/TowerRoomRoleCardState";
import { RoleCard } from "./schema/tower/TroubleRole";
import { RoleManager } from "./schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "./schema/tower/TowerRoomHandCardState";
import {Player } from "./schema/tower/TowerRoomPlayerState";
//import { Character } from "../entities/CharacterEntity";
import { Seat, SeatManager } from "./schema/SeatState";
import { Nominate, NominateManager } from "./schema/NominateState";

import { User } from "../entities/UserEntity";
import { DI } from "../config/database.config";
const bcrypt = require ('bcrypt');

import { MagicBook } from "./schema/tower/TowerRoomMagicBook";
import {ActionManager,Action } from "./schema/tower/TowerRoomActionState";
import { Logger } from "@mikro-orm/core";
const logger = require("../helpers/logger");
export class ReconnectRoom extends Room<TowerRoomState> {
    firstUser: boolean = true    
    // this room supports only 4 clients connected
    maxClients = 100;
    systemTimeout: Delayed;
    systemInterval: Delayed;
    //timerInterval: Delayed;
   // timerTimeout: Delayed;
    voteInterval: Delayed;
    voteTimeout: Delayed;
    dayInterval: Delayed;
    dayTimeout: Delayed;
    nightInterval: Delayed;
    nightTimeout: Delayed;
    isReconnecting:boolean = false;    
    delayedInterval!: Delayed;
    onCreate (options: any) {
        this.setState(new TowerRoomState());
        this.state.init(options);
        this.clock.start();
        this.autoDispose = true;

       // this.runProgress(11,"");
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
//from client  room.send("action",{'action':'select','target':'3'});
//from client  room.send("action",{'action':'nominate','target':'4'});
//from client  room.send("action",{'action':'resetAll'});
//from client  room.send("action",{'action':'selectRole','cardId':'monk'});

        this.initOnMessage();


    }

    async onAuth (client:Client, options:any, request:any) {     
      logger.info("onAuth:" +client.sessionId)
      
      const userRepo = DI.em.fork().getRepository(User);
      // Check for a user with a pending sessionId that matches this client's sessionId
      let user: User = await userRepo.findOne({ username: options.username });
      let validPassword: boolean = await bcrypt.compare(options.password, user.password);
      if (!user || validPassword === false) {
        throw new ServerError(400,"Incorrect username or password");      
       // throw new Error("Incorrect username or password");         
      }
      if (user) {
        // A user with the pendingSessionId does exist  
        // Update user; clear their pending session Id and update their active session Id
        user.activeSessionId = client.sessionId;
        user.pendingSessionId = "";  
        var sec = Date.now() - user.pendingSessionTimestamp;
        user.pendingSessionId = client.sessionId;
        user.pendingSessionTimestamp = Date.now();
        user.updatedAt = new Date();
        await userRepo.flush();
       
        var max = 10000;
        if ( sec<= max) {
          console.log("sec:",sec)
          let timeLeft = Math.ceil((max -sec) / 1000);
          timeLeft = max/1000;  
        
        
          throw new ServerError(400,`Can't log in right now, try again in ${timeLeft} seconds!`);         
        }
       

        // Returning the user object equates to returning a "truthy" value that allows the onJoin function to continue

        return user;
      } else {      
        throw new ServerError(400, "Bad session!");        
      }

      
    }
    adminJoin(client:Client){
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

         client.send("onJoin", player); 
      this.runProgress(10,"");
    }
    playerJoin(client:Client){
      logger.warn("player onJoin:",client.auth.id)
      var id = client.auth.id
      var pid = this.state.pid;
         var  player = new Player().assign({
            id:client.auth.id,
            name :client.auth.username,
            sessionId :  client.sessionId,
            admin : false,
            robot : false
          });
          this.state.players.set(player.id,player);  

          client.send("onJoin", player); 
          /*
      if (pid>=50){
        logger.silly(player.name+"寻找座位中!!!")
        var  book = this.state.magicBook;
        var playerSeat = book.seatManager.playerOnSeat(player)
        if (playerSeat){
          logger.silly(player.name+"已在座位上!! "+client.sessionId)
          this.setRoleSessionIdBySeatId(playerSeat.id,client.sessionId);
          
        }  
      }
      switch (pid) {     
        case  15:
          logger.silly(player.name+"寻找座位中")
          var  book = this.state.magicBook;
          var playerSeat = book.seatManager.playerOnSeat(player)
          if (playerSeat){
            logger.silly(player.name+"已在座位上 "+client.sessionId)      
             this.setRoleSessionIdBySeatId(playerSeat.id,client.sessionId);     
          } else {
              var seat:Seat = book.seatManager.getEmptySeat()
              if (seat){
                  logger.silly(player.name+"自动入座",seat.id)
                  this.takeSeat(player,seat.id)
                 // this.resumeAllTimer();
              } else {
                  logger.silly("没有空位")
              } 
          }
          break;

      }
      */
    }

    onJoin (client: Client) {
     // this.pauseAllTimer();
      logger.info("onJoin:" +client.sessionId)
      //this.timerInfo();
    
      var pid = this.state.progress.pid;     
      if (this.firstUser){
        this.adminJoin(client)        
      } else {
        this.playerJoin(client)
      }

     // this.resumeAllTimer();
     logger.silly("Onjoin Done !!!!!!!!!!!!!")
    }

    
  
    async onLeave (client: Client, consented?: boolean) {
      logger.silly(client.sessionId+ "断线了"+  consented ); 
      this.state.dropPlayer(client.auth.id)
      try {     
          
          if (consented) {                           
            throw new ServerError(400,"手动断线了");  
             //throw new Error("手动断线了");            
          } else{
            //this.pauseAllTimer();
            const newClient = await this.allowReconnection(client, 6000);
            client.send("reconnected", {data : "test"});
            logger.silly("reconnected! client: " + newClient.id);
            this.state.alllowPlayer(client.auth.id)
           // this.resumeAllTimer();
          }
          
          

          
         // this.resumeAllTimer();     
      }       
      catch (e) {            
        this.state.deletePlayer(client.auth.id)
          console.log(e);
      }
    }
    
    onDispose () {

    }

  //每次pid变化时调用
  timerInfo(){  
     // this.broadcast("messages", {action:'timer',data:this.state.progress});
  }
  ClientInfo(kind:string){
   /*
    switch (kind) {                
      case 'resetAll':
        this.broadcast("messages", {action:kind,data:{}});
      break; 
    }

    logger.silly("******************  " +kind +"  ******************")
    */
  }

    runProgress(pid:number,option:any) {  
      /*
       while(this.state.pause==true){
         console.log(" pause")
       }
   */
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

          this.systemTimeout =this.clock.setTimeout(() => {
            this.systemTimeout.clear();
            this.systemInterval.clear();
            this.doAutoFunction(progress.func,option)         
               
          }, delay*1000);
          
          this.systemInterval = this.clock.setInterval(() => {
              delay --;
              this.state.serverTimeout = delay;
              this.state.progress.leftTimeout --;
            
               if ((delay<=5)&& (delay>0))   
                  logger.warn("系统倒计时:"+delay)
          }, 1000);          
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
    doAutoFunction(func:string,value:any){
        var f;
   
         
         if (value)
           var f = eval("this."+func + "(value);");//hello world!
         else {
           var f = eval("this."+func + "();");
         }
    }
    //10
    enterRoom(){
      this.runProgress(11,"");
    }
    //11
    resetAll(){

    //    this.ClientInfo('resetAll')
       logger.silly("resetAll")
      //  this.state.seatManager = this.state.magicBook.seatManager;
        var sm :SeatManager = this.state.magicBook.seatManager
        sm.addEmptySeats();
        sm.unLockAllSeat();
       
        
        this.state.start = false;
  
        this.resetTimer();
        this.resetRoom();
        this.resetPlayers();
        this.state.gameOver = false; 
       
        this.state.witchMoved = false;
        this.state.playerMoved = false;
        this.state.sergantMoved = false;
        this.state.magicBook = new MagicBook();
       
        if (sm.lockedCount>0) {
          logger.silly("@@@@@@@@@@@@@@")
          this.state.magicBook.seatManager = sm;
        }

        this.state.resetDate();

        this.setRoleCardDeck({id:'tb'}); 
        this.setHandCardDeck({id:'tb'});
    
        this.state.magicBook.adminId = this.state.adminId;
       
        this.state.pause = false;
        this.seatChanged();
        this.setProgress(12);   
      }


    //12
    doCreateSeats(){
        
        let book = this.state.magicBook;
        if (book.seatManager.lock){
          this.runProgress(15,'');
          return;

        }
        book.seatManager.doCreateSeats(this.state.maxSeats) 
        if (this.state.options.robots>0)
           this.runProgress(13,'');
        else 
           this.runProgress(15,'');

           return;
  
      }
          //13
      doCreateRobots(){
        console.log("this.state.options.robots",this.state.options.robots)
            for (var i=0;i<this.state.options.robots;i++){
              let player = new Player().assign({
                id: "robot"+String(i+1),
                name :"robot"+String(i+1),
                admin : false,
                robot : true
              });
              this.state.players.set(player.id,player);      
              this.state.players.get(player.id).connected = true;       
             
            }
         //   console.log("robots  players done")
            console.log("this.state.magicBook.roleManager.roleCards.size:",this.state.magicBook.roleManager.roleCards.size)
          this.runProgress(15,"")
      }
  
  

    //15
    checkIfStart(){
      
        this.runProgress(16,"")
     }
     //16
     lockRoom(){      
        this.lock();
        this.runProgress(20,"");
     }    
     //20
     doAutoTakeSeat(){
        var idx = 1;
        if ( this.state.magicBook.seatManager.lock) {
          this.runProgress(21,"");   
          return;
        }
       
       this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {          
 
         if (seat.locked==false){
           var player:Player = this.state.getRandomPlayerNoSeat()  
          
             if (player) {       
               //  console.log("player",player.id)
                
                // console.log(idx);
                 this.takeSeat(player,seat.id);
                 idx ++;
             }
         }
         
       })

        this.state.magicBook.seatManager.lock = true;
        this.seatChanged();
        this.runProgress(21,"");   
      
     }    
     seatChanged(){
      this.state.seatChanged = new Date().getTime();
     }
     progressChanged(){
      this.state.progressChanged = new Date().getTime();
     }
     resetRoom(){
     
        this.state.handCardDeck = new HandCardDeck();
       // this.state.roleManager = new RoleManager();      
        this.state.currentTurn = '';
        this.state.lockRoom = false;
  
      }
      resetPlayers(){
        this.state.players.forEach((player:Player) => {  
           var p =  player.reset();
           this.state.players.set(p.id,p);    
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
       let book =  this.state.magicBook;
       let seatManager = book.seatManager;
       seatManager.sort();
      //  console.log("waitAdminStart:",this.state.start)
/*
        //如果设定重连为否就无法重连。 
        if (this.state.options.reconnect == false) {
          logger.silly("不锁房");      
          this.unlock();  
          
        } else {
          logger.silly("房间可重连，已锁房");   
          this.lock();  
        }
*/
      this.runProgress(22,"");   
    }

     //22
    doAutoSeatReady(){
      this.state.magicBook.seatManager.lock = true;
      this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {    
          if (seat.locked){
            seat.ready = true;
          }      
         
      })  
      this.state.magicBook.seatManager.setSeat();

      this.runProgress(23,"");
    }
    
     //23
     sendPreviewRole(){
      this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {  
       
        if (seat){
          this.state.setPreviewRoleCard(seat);
         // this.previewRoleInfo(seat);
        } else {
          console.error("critical error")
        }  


      })

      this.runProgress(24,"")
    }
    //24
    doAutoLockRoom(){
      this.state.lockRoom = true;
      this.runProgress(25,"");
    }


/*
    previewRoleInfo(seat:Seat){
        var data = seat.getPreviewRoleCards();
        this.broadcast("messages", {action:'previewRoleInfo',id:seat.playerId,data:data});     
      }
  */  



    selectPreviewRole(sessionId:string,roleId:string):boolean{
     
      console.log("selectPreviewRole:",sessionId ,":",roleId)
      if (!sessionId) return;
      if (!roleId) return;
     // var player = this.state.players.get(data.sessionId)        
     // if (!player) return;
      var seat:Seat = this.state.magicBook.seatManager.getSeatBySessionId(sessionId)
      if (!seat) return;
     // console.log("seat",seat.playerName)
      if (!seat.previewRoleCards.has(roleId)) return;
     // console.log("seat",seat.playerName)
      var _card = seat.previewRoleCards.get(roleId);
      if (!_card) return;
     // console.log(_card ,":",_card.name)
      seat.pickRoleCard.clear();
      seat.pickRoleCard.set(_card.id,_card);  
     // console.log('selectRole :',+_card.id+":"+_card.name)   
     return true;
    }

    //25
    doAutoSelectRole() {    
      this.state.magicBook.seatManager.seats.forEach((seat:Seat) => {  

            var  cards = Array.from(seat.pickRoleCard);
            if (cards.length==0){
                const arr = Array.from(seat.previewRoleCards.keys());
              
                let  idx = Math.floor((Math.random() * arr.length) + 0);
            
                let id= arr[idx];
               
               // console.log("id",id)
                var _card = seat.previewRoleCards.get(id);
                if (_card){
                  seat.pickRoleCard.clear();             
                  seat.pickRoleCard.set(_card.id,_card);  
                }
              
        
  
            } else {
              var role = cards[0]
              console.log(role)
              console.log("player "+seat.playerName +" selected" )            
            } 
        
          
      })

      
     this.runProgress(26,"");
    } 
    //26
    setMagicBook(){
        
        var sm:SeatManager =   this.state.magicBook.seatManager;
        var playerCount = this.state.magicBook.seatManager.seats.size;
        this.addWishRole();
        this.state.setMagicBook(playerCount,true)
        if (sm.lock){
          this.state.magicBook.seatManager = sm;
          logger.silly("!!!!!!!!!!")
        }
      
        this.state.magicBook.initMessageManager();
        this.state.magicBook.addMessage(this.state.magicBook.report);
      this.runProgress(27,"")
    }


    addWishRole(){
        let book = this.state.magicBook
        var arr = book.seatManager.getRandomArray();
        console.log('arr',arr)
        for (var i =0;i<arr.length;i++){
          var seatId = arr[i];       
          var seat = this.state.magicBook.seatManager.get(seatId);
         // var player =   this.state.players.get(seat.playerId);        
          var card = seat.pickRoleCard.values().next().value
       //   console.log("addWishRole " +seatId+":"+card.name)        
          
          this.state.magicBook.addWishRole(i,card.id,card.name,card.team,seat.id,seat.playerId,seat.idx)        
        }
    }      

    resetTimer(){
        if (this.systemTimeout) {
          this.systemTimeout.clear();
        }
        if (this.voteInterval){
          this.voteInterval.clear();
        }
        if (this.voteTimeout){
          this.voteTimeout.clear();
        }
        if (this.dayInterval){
          this.dayInterval.clear();
        }
        if (this.dayTimeout){
          this.dayTimeout.clear();
        }
        if (this.nightTimeout){
          this.nightTimeout.clear();
        }
        if (this.nightInterval){
          this.nightInterval.clear();
        }
  
  
      }

      
    setRolesSessionIdBySeat(){
      var roleManager:RoleManager =   this.state.magicBook.roleManager;
      var seatManager:SeatManager =   this.state.magicBook.seatManager;
      seatManager.seats.forEach(seat=>{
        if (seat.robot == false){
          var role = roleManager.getRoleBySeatId(seat.id);
          role.sessionId = seat.sessionId;
          roleManager.roles.set(role.id,role);
          console.log("role.sessionId", role.sessionId+":"+ seat.playerName+":"+seat.id+":"+role.id)
        }
      })
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
    setRoleCardDeck(option:any){
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
  
        this.runProgress(29,"")
      }
      //29
      sendRole(){
        this.setRolesSessionIdBySeat();
       
       this.runProgress(30,"");
      } 
  
      //30
      setupDayAndNight(){
  
  
        this.runProgress(40,"");
      }
      //40
      gameStart(){    
        this.state.magicBook.round  =0;
        this.state.magicBook.initMessage();
       this.runProgress(41,"")
      }  


    //41
    nextRound(){
      this.resetTimer();
      let book =  this.state.magicBook;
      
      book.nextRound();
      book.reportDate();
      book.releasePoision();
      book.releaseBuff();
      book.resetVoteData();
      book.setLuck();
      

      if (book.isDay()){
        this.runProgress(60,"");
      }else {
        this.runProgress(50,"");
      }

      
    }

    //50
    waitNightAction(){      
       this.nightDelay(0,"autoNightAction")      
    }

    /**
     * 如果玩家没有执行夜晚行动，就自动执行 
     */
    
    autoNightAction(){
      console.log("autoNightAction")
      let book =  this.state.magicBook
      book.reset();
      book.getNightOrder();

      let arr = Array.from(book.roleManager.order.values())   
      
      book.roleManager.order.forEach((role:RoleCard) => {  
        if (book.round == 1) {
          logger.silly(role.title()+book.getDate()+"技能");
          var _role :RoleCard = book.roleManager.roles.get(role.id);

          _role.autoUseSkill(this.state.magicBook);

        }else{       
          logger.silly(role.name +"("+role.seatId +") "+book.getDate()+"技能");           
           role.autoUseSkill(book);          
        }

      }); 

      book.checkDemonBuff();


      this.nightDelay(1,"checkNewAction")      
      
     // 
    }
    /**
     *处理 : 晚上全部玩家行动后，产生的新action 
     */

    checkNewAction(){
      this.setProgress(53)
      let book = this.state.magicBook
      let actionManager =book.actionManager
      let size = actionManager.actions.size
      console.log("checkNewAction:" ,size)
      
      if (size>0){
          logger.silly("等待玩家回应")
          this.nightDelay(10,"runAutoNightNewAction")      

      } else {
        logger.silly("下一回合")
        this.checkGameOver(41);
      }       
        

    }
    runAutoNightNewAction(){
      logger.silly("自动执行命令")
      this.setProgress(54)
      let book = this.state.magicBook
      let actionManager =book.actionManager
      let size = actionManager.actions.size 
      if (size>0)
        this.autoSelectTargetAndRun();
      else 
        this.runProgress(41,"");

      
      
     // 
    }

    autoSelectTargetAndRun(){
      let book = this.state.magicBook
      let actionManager =book.actionManager
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
      this.runProgress(41,"");    

    }
    

    nightDelay(delay:number,func:string){
      this.state.serverTimeout = delay;
      if (this.nightInterval)
        this.nightInterval.clear();
      if (this.nightTimeout)
        this.nightTimeout.clear();

      this.nightTimeout =this.clock.setTimeout(() => {
        this.nightTimeout.clear();
        this.nightInterval.clear();

        var f = eval("this."+func + "();");
      //  this.autoNightAction();
      }, delay*1000);
      
      this.nightInterval = this.clock.setInterval(() => {
           delay --;
           this.state.serverTimeout = delay;
          //this.state.timeout = delay;
          if (delay<=3)
          logger.warn("倒计时:"+delay)
      }, 1000);     
      
    }



    //60
    waitDayAction(){
       

      //this.state.progress.leftTimeout =progress.timeout; 
      //this.state.progress.name =progress.name; 
      this.progressChanged();

      // 設置間隔計時並保存其引用
      // 以便後續清理工作
      var  delay = 5;
           // 10 秒過後清理計時器;
      this.state.serverTimeout = delay;
      this.dayTimeout =this.clock.setTimeout(() => {
        this.dayTimeout.clear();
        this.dayInterval.clear();
        this.dayActionOver();
      }, delay*1000);
      
      this.dayInterval = this.clock.setInterval(() => {
           delay --;
           this.state.serverTimeout = delay;
           if (delay<=3)
      
          logger.warn("倒计时:"+delay)
      }, 1000);   
      
      this.setProgress(62);


    }
    autoVoteAction(){
       
      // let book =  this.state.magicBook
      // book.reset();
 
 
       // 設置間隔計時並保存其引用
       // 以便後續清理工作
       var  delay = 5;
            // 10 秒過後清理計時器;
            this.state.serverTimeout = delay;
       console.log('autoDayAction')
       this.voteTimeout =this.clock.setTimeout(() => {
         this.voteTimeout.clear();
         this.voteInterval.clear();
         this.voteActionOver();
        
       }, delay*1000);
       
       this.voteInterval = this.clock.setInterval(() => {
            delay --;
            this.state.serverTimeout = delay;
           console.log("vote left secs:",delay);
       }, 1000);   
         
 
 
     }

    
    dayActionOver(){
      let book =  this.state.magicBook
     
      book.addMessage(book.getDate()+"结束")
      this.runProgress(64,"");
      // this.checkGameOver(41);
    }
    voteActionOver(){
      let book =  this.state.magicBook
     // console.log(book.round);
      book.addMessage(book.getDate()+"此轮投票结束(" +book.round+")")
      //this.checkGameOver(41);
      this.startDayTimer();
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
          this.checkGameOver(41);

        }


         return
        
      }

      var msg = nominateManager.startNominate(target,starter);   
      if (msg){
        book.addMessage(msg);
        this.stopDayTimer();
        this.autoVoteAction();
        this.setProgress(63);
      } else {
        console.error("criticl error")
      }
      
     
    }
    stopDayTimer(){
      logger.silly("stopDayTimer")
      this.dayTimeout.pause();
      this.dayInterval.pause(); 
    }
    startDayTimer(){
      logger.silly("startDayTimer")
      this.dayTimeout.resume()
      this.dayInterval.resume();
    }
    pauseAllTimer(){
      logger.warn("pauseAllTimer!!!!!!!!!!!!!!!!")
      if (this.dayTimeout)
      this.dayTimeout.pause();
      if (this.dayInterval)
      this.dayInterval.pause(); 
      if (this.voteTimeout)
      this.voteTimeout.pause();
      if (this.voteInterval)
      this.voteInterval.pause();
      if (this.nightTimeout)
      this.nightTimeout.pause();
      if (this.nightInterval)
      this.nightInterval.pause(); 
      if (this.systemTimeout) 
      this.systemTimeout.pause();
      if (this.systemInterval) 
      this.systemInterval.pause();
      this.clock.stop();

      this.state.pause = true;
    }
    resumeAllTimer(){
      logger.warn("resumeAllTimer!!!!!!!!!!!!!!!!")
      if (this.dayTimeout)
      this.dayTimeout.resume();
      if (this.dayInterval)
      this.dayInterval.resume(); 
      if (this.voteTimeout)
      this.voteTimeout.resume();
      if (this.voteInterval)
      this.voteInterval.resume();
      if (this.nightTimeout)
      this.nightTimeout.resume();
      if (this.nightInterval)
      this.nightInterval.resume(); 
      if (this.systemTimeout) 
      this.systemTimeout.resume();
      if (this.systemInterval) 
      this.systemInterval.resume();
      this.clock.start();

      this.state.pause = false;
    }

    isTimerActive(){
      var result =false;
      if (this.dayTimeout)
          if (!this.dayTimeout.paused) result = true
      if (this.dayInterval)
          if (!this.dayInterval.paused) result = true
      if (this.voteTimeout)
          if (!this.voteTimeout.paused) result = true
      if (this.voteInterval)
          if (!this.voteInterval.paused) result = true
      if (this.nightTimeout)
         if (!this.nightTimeout.paused) result = true
      if   (this.nightInterval)
          if (!this.nightInterval.paused) result = true
      if (this.systemTimeout) 
          if (!this.systemTimeout.paused) result = true
      if (this.systemInterval) 
          if (!this.systemInterval.paused) result = true          
       return result;
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
      console.log("closeVote!!!")
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

    }



    adminCommand(client:Client, message:any){
      let book = this.state.magicBook;
      let seatManager:SeatManager = book.seatManager;
      let nominateManager :NominateManager  =book.nominateManager;
      var action = message.action ;
      var player = this.state.players.get(client.auth.id);
      var seatId = message.seatId;

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
            this.pauseAllTimer();
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
            /*                    
        case 'changeSeat':
            this.state.changeSeat(message.a,message.b);
            break;
            */                    
      }
      
    


    }

    playerCommand(client:Client, message:any){
      //console.log("playerCommand",message)
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
              
          case 'nominate':
              if (!message.seatId) return;
              if (this.state.progress.pid !=62) return;
            // if (nominateManager.voting) return;
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
            var result = this.selectPreviewRole(client.sessionId,message.data.roleId)
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

          case 'systemTimeOut':
              this.state.systemTimeout =  this.state.progress.timeout - Math.ceil(this.systemTimeout.elapsedTime/1000);
              break;                         
        }
        

        
        

      
    }

   

  }
