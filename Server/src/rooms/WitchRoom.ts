import { Room, Client ,ServerError ,Delayed} from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { InteractableState, NetworkedEntityState, RoomState } from "./schema/RoomState";
import { RoleCardDeck,RoleCard } from "./schema/RoleCardState";
import { HandCardDeck,HandCard } from "./schema/HandCardState";
//import request from "superagent";
import { User } from "../entities/UserEntity";
import { DI } from "../config/database.config";
import * as authController from "../controllers/authController";
import * as characterController from "../controllers/characterController";
import {StoryRoomState, Progress } from "./schema/StoryRoomState";
import {Player,PlayerCharacter } from "./schema/PlayerState";
import { Character } from "../entities/CharacterEntity";
import { Seat } from "./schema/SeatState";
import e from "express";
import { Logger } from "mongodb";
import { silly } from "../helpers/logger";
const bcrypt = require ('bcrypt');
//import Auth from "./auth/auth";
let userData={};
let characterData={};
const waitReconnect = 6000;// wait client reconnect 6000 sec
const logger = require("../helpers/logger");
const FACEBOOK_APP_TOKEN = "***";


export class WitchRoom extends Room<StoryRoomState> {
    firstUser: boolean = true
    // this room supports only 4 clients connected
    maxClients = 100;

  

    

    systemTimeout: Delayed;
    randomMoveTimeout: Delayed;



    async onCreate (options:any) {
     
      if (options["playerChooseCharacter"]==true) {
          this.state.playerChooseCharacter = true;
      }
      if (options["maxClients"]>0) {
         this.maxClients = options["maxClients"] 
      }
        if (options["master"] ==true) {  
            userData = await authController.auth(options);

            
            if (userData) {
                this.roomId = String(userData.output.user._id);           
               
         
             } else {
                 throw new ServerError(400, "bad access token!!");
                 return;
             }
        }

        this.setState(new StoryRoomState());
        this.state.init();
        this.setProgress(10);
        this.state.maxClients = this.maxClients;
        this.state.maxSeats = 12;
        this.state.minSeats = 2;

        
        const characterRepo = DI.em.fork().getRepository(Character);
        let characters = await characterRepo.findAll();
        characters.forEach((character:Character) => {
         
          var playerCharacter = new PlayerCharacter().assign({    
            id :character.id,     
            name :character.name,
            brief: character.brief,
            age: character.age,
            sexual :character.sexual,
            used:false  
          });            
        this.state.characters.set(playerCharacter.id, playerCharacter);


       })



      
        this.setPatchRate(50);


        this.setSimulationInterval(dt => {
        this.state.serverTime += dt;

        });


        if (options.room_password) {
             this.setPrivate();
        }

        this.onMessage("message", (client, message) => {
            this.state.chatMessageCount++;
            this.broadcast("messages", `(${client.sessionId}) ${this.state.chatMessageCount} : ${message} `);
            
        });

        this.onMessage("reset", (client, message) => {
            var player = this.state.players.get(client.sessionId);
            if (!player) return;
            if (player.admin==false) return;
            this.doAutoRestart();
        });     
        
//from client  room.send("action",{'action':'useHandCard','target':'123dd','cardId':'55533d'});
//from client  room.send("action",{'action':'deal'});
//from client  room.send("action",{'action':'blackcat','target':'123dd','cardId':'55533d'});
//from client  room.send("action",{'action':'protect','target':'123dd','cardId':''});
//from client  room.send("action",{'action':'murder','target':'123dd','cardId':''});
//from client  room.send("action",{'action':'surrender','target':'','cardId':'123222'});
         this.onMessage("action", (client, message) => {
              if (this.state.gameOver )      return ;
              if (message.action == 'changeSeat'){
                console.log(message.a ,message.b)
                this.state.changeSeat(message.a,message.b);
              
              }else if (message.action == 'systemTimeOut'){
                console.log('systemTimeout.elapsedTime:',this.systemTimeout.elapsedTime)
                this.state.systemTimeout =  this.state.timeOut - Math.ceil(this.systemTimeout.elapsedTime/1000);
               

              
              }
              else if (message.action == 'deal'){
                
                if (this.state.pid!=80){
                  console.log('此时不能DEAL:',this.state.pid)
                    return ;
                }
                this.playerAction(client,message);

              }else  if (message.action == 'useHandCard'){

                 if (this.state.pid!=80){
                   console.log('此时不能出牌:',this.state.pid)
                     return ;
                 }
                 this.playerAction(client,message);

              }else  if (message.action == 'murder'){
                  if (this.state.pid!=801)   return ; 
                  this.witchAction(client,message);
              }else  if (message.action == 'blackcat'){
                  if (this.state.pid!=60)   return ; 
                  this.witchAction(client,message);

              }else  if (message.action == 'protect'){
                  if (this.state.pid!=802)   return ; 
                  this.sergantAction(client,message);
              }else  if (message.action == 'surrender'){
                  if (this.state.pid!=803)   return ; 
                  this.playerAction(client,message);

              } if (message.action == 'infect'){
                if (this.state.pid!=902)   return ; 
                this.playerAction(client,message);

            }
    
           
         });  

    }

    async onAuth (client:Client, options:any, request:any) {

    //  this.broadcast("messages", `${ client.sessionId } onAuth.`+ this.roomId);
       
        const userRepo = DI.em.fork().getRepository(User);

        // Check for a user with a pending sessionId that matches this client's sessionId
        let user: User = await userRepo.findOne({ username: options.username });
        let validPassword: boolean = await bcrypt.compare(options.password, user.password);

        if (!user || validPassword === false) {

            throw "Incorrect username or password";
            return;
        }

    
        if (user) {
          // A user with the pendingSessionId does exist
    
          // Update user; clear their pending session Id and update their active session Id
          user.activeSessionId = client.sessionId;
          user.pendingSessionId = "";
    
          // Save the user changes to the database
          await userRepo.flush();
    
          // Returning the user object equates to returning a "truthy" value that allows the onJoin function to continue
          return user;
        }
        else {
          // No user object was found with the pendingSessionId like we expected
          logger.error(`On Auth - No user found for session Id - ${client.sessionId}`);
    
          throw new ServerError(400, "Bad session!");
        }

    }


    async onJoin (client: Client) {
        var data = {action:'join',sessionId:client.sessionId}
      //  this.broadcast("messages", `${ client.sessionId } joined.`+ this.roomId);
        this.broadcast("messages", data);
        let player = new Player().assign({
          id: client.id,
          name :client.auth.username,
          admin : this.firstUser
        });
        this.firstUser = false;
        var seatId = this.state.seatIdx.toString();
        console.log("seatId",seatId)

        let seat = new Seat().assign({
          id: player.id,
          name :"",
          playerId :player.id,
          connected: true,
          player : player,
          idx:this.state.seatIdx
         
        });
        this.state.seats.set(player.id,seat);  
        this.state.seatIdx ++;
        this.state.seatChanged = new Date().getTime();  
        this.state.players.set(client.sessionId,player);      
        this.state.players.get(client.sessionId).connected = true;       
        var count = this.state.players.size;
        if (this.state.seats.size >= this.state.minSeats) {
          this.runProgress(20,'');
          // lock this room for new users
           // this.lock();
        }
        this.state.setSeat();
    }

    async onLeave(client: Client, consented: boolean) {

        var data = {action:'leave',sessionId:client.sessionId}
        this.state.seatChanged = new Date().getTime();          
        this.broadcast("messages", data);
        var player :Player = this.state.players.get(client.sessionId);
        player.connected = false;
        this.state.seats.get(player.id).connected = false;
        const userRepo = DI.em.fork().getRepository(User);    
        // Find the user object in the database by their activeSessionId
        let user: User = await userRepo.findOne({ activeSessionId: client.sessionId });    
        if (user) {
            // Clear the user's active session
            user.activeSessionId = "";
            // Save the user's changes to the database
            await userRepo.flush();
        }
    
        try {
            if (consented) {
            throw new Error("consented leave!");
            }
    
            logger.info("let's wait for reconnection for client: " + client.id);
            //wait client 10 sec
            const newClient = await this.allowReconnection(client, waitReconnect);
            logger.info("reconnected! client: " + newClient.id);
            //var data = {action:'reconnect',sessionId:client.sessionId}
           // this.broadcast("messages", data);
           
            player.connected = true;
            player.reconnectCount ++;
            this.state.seatChanged = new Date().getTime();  


            this.state.seats.get(player.id).connected = true;

            this.reconnectTimerInfo(player); 
            this.updatePlayerInfo(player); 
    
        } catch (e) {
            logger.info("disconnected! client: " + client.id);
            logger.silly(`*** Removing Networked User and Entity ${client.id} ***`);
    
            //remove user
            
            let userToleave = this.state.players.get(client.id);
            if (userToleave) {
             this.state.players.delete(client.id);
             this.state.seats.delete(client.id);
             this.state.seatChanged = new Date().getTime();  
            }
            
        }
        
       
       
    }

    onDispose () {
        console.log("Dispose AdminRoom");
        
    }


     runProgress(pid:number,option:any) {
    
      this.state.pid = pid;
      /*
      if (this.state.gameOver && pid<900) {
        console.log("this game is already over !!!!!!!!!!!")
        return;
      }
      */
      if (this.systemTimeout) {
        this.systemTimeout.clear();
      } 
      var progress:Progress = this.getProgress(pid);




     
      if (progress){
        this.state.timeOut = progress.timeOut;
        this.timerInfo();
        if (progress.func)
           this.systemTimeout = this.clock.setTimeout(() => this.doAutoFunction(progress.func,option), progress.timeOut * 1000);
        else 
          this.systemTimeout = this.clock.setTimeout(() => this.doNothing(), progress.timeOut * 1000);
        if (progress.buff){
         // var player:Player = this.state.players.get(this.state.currentTurn);
          this.state.seats.forEach((seat:Seat) => {      
            var player = seat.player;
            this.buffCheckInfo(player);
          })
        }
    
          if (this.state.currentTurn)
           logger.silly(progress.name+'('+progress.id+')'+" player:"+this.state.players.get(this.state.currentTurn).name)  
          else 
            logger.silly(progress.name+'('+progress.id+')'+" timeOut:"+progress.timeOut)  
      } else {

        console.error("critical error no progress:" +pid)
      
      }

    }
    doNothing(){

    }
    doAutoFunction(func:string,value:any){
     var f;

      
      if (value)
        var f = eval("this."+func + "(value);");//hello world!
      else {
        var f = eval("this."+func + "();");
      }
    }
     //20
    doAutoSeatReady(){
      this.state.seats.forEach((seat:Seat) => {          
          seat.ready = true;
      })      
      
      this.runProgress(25,"");

    }
    

    //25
    doAutoSelectCharacter () {    
      /*  
      this.state.players.forEach((player:Player) => {          
        if (player.playerCharacter != null) {
            let playerCharacter:PlayerCharacter = this.state.getRandomCharacterUnused();
            player.playerCharacter =playerCharacter;
            playerCharacter.used = true;
        }
      })
      */  
      
      this.resetRoom();      
    }
    resetPlayers(){
      this.state.players.forEach((player:Player) => {  
        player.reset();

      }); 
    }

    resetRoom(){
      logger.silly("resetRoom")
    
      this.state.handCardDeck = new HandCardDeck();
      this.state.roleCardDeck = new RoleCardDeck();      
      this.state.currentTurn = '';
     this.runProgress(30,'');
    }

    


    setRoomSeed(){
      this.state.seed = 'dsfafd123' //todo;
    }

    setBackground(){
     //todo;
    }
    setCharacterEvent(){
     //todo;
    }
    setCharacterRelation(){
     //todo;
    }
   
    getPlayer(sessionId:string){
        return  this.state.players.get(sessionId);
      //return this.state.players[sessionId];
    }
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
    logTarget(player:Player){
     
      if (player){
        logger.silly("目标是:"+player.name)
      } 
    }
    logRoleCard(card:RoleCard){     
      if (card){
        logger.silly("身份是:"+card.name)
      } 
    }    
    
    turnPlayerName():String{
      var player:Player = this.state.players.get(this.state.currentTurn);     
      var name = String(player.name);
      return name;

    }
    //70
    nextTurn(playerId:string){
      this.checkGameOver(0)
      
      if (this.state.gameOver && this.state.pid<910) return;   

      var player:Player;
       
      if (playerId){
         player = this.state.players.get(playerId)
         this.state.currentTurn =player.id;
      } else{
         player = this.state.getNextAlivePlayer(this.state.currentTurn);
         this.state.currentTurn =player.id;
      }  
      if (player.checkIfCuffed()){
         /*
        console.log(player.name+" CUFFED!!!!!!!!!!!!");
       
        var nextPlayer:Player  = this.state.getNextAlivePlayer(this.state.currentTurn);
        this.state.currentTurn =nextPlayer.id;
        console.log("next player is " +nextPlayer.name);
        */
        this.runProgress(83,'');    
        return;
      }
    

     
      this.state.playerMoved = false;
      this.state.witchMoved = false;
      this.state.sergantMoved = false;      
      this.runProgress(80,'');    


    }

    cuffed():boolean{
      console.log(this.state.currentTurn+' cuffed')
      var player:Player = this.state.getNextAlivePlayer(this.state.currentTurn);         
      this.state.currentTurn =player.id;
      this.runProgress(70,player.id); 
      
  
      return false;
    }


      //83

    //61
    firstBlackCat(playerId:string){
      this.runProgress(70,playerId)  
    }
    
    //801 60 
    doAutotWitchAction(kind:string){
      //kind  =blackcat 
      //kind = murder
    
      if (this.state.witchMoved) return;
      
      if (kind=="blackcat"){        
        let player:Player = this.state.getRandomPlayerAlive('');
        let blackCatCard = this.state.handCardDeck.blackCatCard;
        player.buffCards.set(blackCatCard.id,blackCatCard);
        this.state.witchMoved = true;       

        this.runProgress(61,player.id);
      
      }  

      if (kind=="murder"){
        let player:Player = this.state.getRandomPlayerAlive('');   
        let murderCard = this.state.handCardDeck.murderCard;
        player.buffCards.set(murderCard.id,murderCard);              
        this.state.witchMoved = true;

        this.runProgress(802,'');
      }
    }
    claimDeath(player:Player){
      console.log(player.name,"死了");
      player.alive = false;

      
      player.buffCards.forEach((card:HandCard) => {        
        this.state.handCardDeck.usedCards.set(card.id,card);        
      }); 
      player.buffCards.clear();

      player.handCards.forEach((card:HandCard) => {        
        this.state.handCardDeck.usedCards.set(card.id,card);
      });       
      player.handCards.clear();

      
    }

    claimWitch(player:Player){
      player.alive = false;
      console.log(player.name,"是巫婆");
      this.claimDeath(player);      
      
    } 

    //901
    doAutoKillerAction(killerId:string){ 

     
      var player:Player = this.state.getPlayerOwnBlackCat(); 
      var killer = this.state.players.get(killerId)



      if (player&& killer){
        let roleCard :RoleCard = player.getRandomRoleCard();
        if (killerId == player.id){
          roleCard = player.getRandomRoleCardCitizenFirst()
        }


        roleCard.used = true;
        this.killInfo(killer,player,roleCard);        
      } else {     
         console.log("critical error!!!")
        // this.setProgress(807);
      }
   
      this.checkGameOver(902)
    }





    //902
    /*
      挑选下一个活著的玩家一张身份牌进入自已的pickRoleCard;
    */
    doAutotInfectAction(){

      this.state.players.forEach((player:Player) => {   
      console.log("doAutotInfectAction player.name",player.name)
          if (player.pickRoleCard.size ==0){
        console.log("player.pickRoleCard.size ",player.pickRoleCard.size )
            var nextAlivePlayer = this.state.getNextAlivePlayer(player.id);
            nextAlivePlayer.checkAlive();
        console.log("nextAlivePlayer ",nextAlivePlayer.name +":"+nextAlivePlayer.life)
            
            var card :RoleCard = nextAlivePlayer.getRandomRoleCard();
        console.log('picked card '+card.id+":"+card.name)
            card.picked = true;
            player.pickRoleCard.set(card.id,card);
            console.log(player.name+"从"+nextAlivePlayer.name+"选了张 "+card.id+":'"+card.name)

          } else {
            var cards = Array.from(player.pickRoleCard.keys());
            var cardId = cards[0];
            card = player.pickRoleCard.get(cardId);  
            console.log(player.name+"已经手动从下家"+nextAlivePlayer.name+"选好了身份牌-"+card.id+":"+card.name)
          }

      })

      this.runProgress(903,'')
    }

    //903
    /*
    checkInfectSucess(){
       var result = true;
       this.state.players.forEach((player:Player) => {     
          if (player.alive){
            if (player.pickRoleCard.size ==0){
              result = false;
            }
          }
          
       })        

       console.log('checkInfectSucess', result);
      
      if (result==true)  {
        
        
        this.state.players.forEach((player:Player) => {  
          player.addPickCard();           
        })
        this.state.deletePickCard();
        this.state.checkAlive();
        this.checkGameOver(70);

      } else {
        console.log('checkInfectSucess', result);
        this.runProgress(902,'');
      }
    
    }
    */
    checkInfectSucess(){
      console.log('checkInfectSucess');  
       this.state.players.forEach((player:Player) => {  
         player.addPickCard();           
       })
       this.state.deletePickCard();
       this.state.checkAlive();
       this.checkGameOver(70);   
   }




  

    //802
    doAutoSergantAction(){
     // if (this.state.sergantMoved) return;
     
      var sergant:Player = this.state.getSergant();

     
      if (sergant){  
        let player:Player = this.state.getRandomPlayerAlive(sergant.id);   
        let sergantProtectCard = this.state.handCardDeck.sergantProtectCard;
        if (player){
          player.buffCards.set(sergantProtectCard.id,sergantProtectCard);
          this.logTarget(player);    
       
        }
         
       
      } else {
        
        this.runProgress(806,'');      
      }
      this.runProgress(803,'');

    }
     //803
    doAutoSurrenderAction(){
      
     
    //  this.state.checkAlive();

      this.state.players.forEach((player:Player) => {             
 
        if (player.checkBuffByName('保护') ==false){
          if (player.getLife()>1){
            if ( player.pickRoleCard.size==0){          
              var card:RoleCard = player.getRandomRoleCardCitizenFirst();
              console.log(player.name+"AUTO选择了-"+card.id+":"+card.name)   
              player.pickRoleCard.set(card.id,card);
              player.claimSurrender = true;
             
            }else {
              var cards = Array.from(player.pickRoleCard.keys());
              var cardId = cards[0];
               card = player.pickRoleCard.get(cardId);    
              
               console.log(player.name+"已手动选择了-"+card.id+":"+card.name)      
            }
          }
        } else {
          console.log(player.name+" protected!!!!!!!!!!!!!!");      
        }

        player.checkAlive();
        

      });


      this.runProgress(804,'');
    }

    //804
    checkSurrenderSucess(){

      this.state.players.forEach((player:Player) => {     
        if (player.pickRoleCard.size>0){ 
          var cards = Array.from(player.pickRoleCard.keys());
          var cardId = cards[0];
          var card = player.pickRoleCard.get(cardId); 
          if (card){
          
            if (player.roleCards.has(card.id)){
              var c = player.roleCards.get(card.id);
              c.used = true;
              player.claimSurrender = true;
              this.surrenderInfo(player,player,card)
            } 
          }
         
          player.pickRoleCard.clear();
        } 
        player.checkAlive();
      });

    
      this.checkGameOver(808)
    }


     //88
    checkMurderScuess(){     
     
      this.state.players.forEach((player:Player) => {             
         var sergantProtectCard= this.state.handCardDeck.sergantProtectCard;
         var murderCard = this.state.handCardDeck.murderCard;
        
        if (player.buffCards.has(murderCard.id)){
           player.buffCards.delete(murderCard.id);
           if (player.buffCards.has(sergantProtectCard.id)){
              player.buffCards.delete(sergantProtectCard.id);             
              this.setProgress(805);
              this.logTarget(player);
           } else {            
              

               if (player.claimSurrender==false){
                console.log("没自首被杀了")
                this.logTarget(player);
                this.claimDeath(player);
               } else {
                this.setProgress(809);
                this.logTarget(player);  
               }   
           }           
        } 
       
      }); 
   
     
     this.checkGameOver(70)
    }


    doAutoGameOverAction(){
      console.log("doAutoGameOverAction")
    
      this.runProgress(911,'');
    }

    doAutoReportScore(){
      console.log("doAutoReportScore")
     
      this.runProgress(912,'');

    }
    doAutoRestart(){
      console.log("doAutoRestart")
      
      this.state.gameOver =false;

      this.runProgress(20,'');
    }
    
  //30
   setRoomValue(){
      console.log("setRoomValue");
      this.resetRoom();
      this.resetPlayers();
      this.state.gameOver = false; 
     
      this.state.witchMoved = false;
      this.state.playerMoved = false;
      this.state.sergantMoved = false;
      this.setRoomSeed();

      this.setBackground();
      this.setCharacterEvent();
      this.setCharacterRelation();

      //
     
      var options;
      if (this.state.seats.size ==2)
       options ={'平民':8,'警长':1,'女巫':1}     
      if (this.state.seats.size ==3)      
       options ={'平民':13,'警长':1,'女巫':1}   
      this.setProgress(40);   
      this.setRoleCardDeck(options); 
      this.state.checkRole();    
      
      this.setProgress(50);
      this.setHandCardDeck(options);
      this.state.checkAlive();

       
     // this.setWitchActionTimeout('blackcat'); 
      this.runProgress(60,'blackcat')
      
    }

    // role card
    setRoleCardDeck(option:any){
      var roleCardDeck = new RoleCardDeck();
      this.state.roleCardDeck = roleCardDeck;
      roleCardDeck.init(option);
      roleCardDeck.shuffle();
      //Deal
      
      this.state.players.forEach((player:Player) => {             
          for (var i =0;i<5;i++){ 
            var roleCard:RoleCard = roleCardDeck.deal();
            player.roleCards.set(roleCard.id,roleCard);    
          } 

          player.checkAlive();          
          this.playerClaim(player)

          let card :RoleCard = player.getRandomRoleCard();

         
      });
        
      
    }
    playerClaim(player:Player){

      logger.silly(player.reportRole())
    }

    // hand card 
    
     setHandCardDeck(option:any){
      var handCardDeck = new HandCardDeck();
      this.state.handCardDeck = handCardDeck;
      handCardDeck.init(option);
      handCardDeck.shuffle();
    
      //first Deal
      this.state.players.forEach((player:Player) => {      
          
          for (var i =0;i<3;i++){ 
            var handCard:HandCard = handCardDeck.deal();
           
            this.state.playerAddHandCard(player,handCard);
            
            
           

          } 
          this.updatePlayerInfo(player);
          this.updateHandCardsInfo(player);
      });
     
      //resetBlackCard
      handCardDeck.resetBlackCard();     

      var card:HandCard = this.state.handCardDeck.firstCard();
      console.log(card.id,card.name);
 
      
    }


    playerAction (client: Client, data: any) {
      

      if (client.sessionId === this.state.currentTurn) {
        console.log('playerAction:',data)

        const playerIds = Array.from(this.state.players.keys());
        var player = this.state.players.get(client.sessionId)
        if (data.action=="deal"){
          this.doDeal(client.sessionId);
          this.state.playerMoved = true;          
        } 
        if(data.action=="useHandCard") {
         // console.log('useHandCard data 1',data)
          var nextAlivePlayer:Player = this.state.getNextAlivePlayer(client.sessionId); 
          var  card:HandCard 
          if (data.cardId=='')
            card = player.getFirstCard('red');
          else 
            card = player.handCards.get(data.cardId);

          if (card){
            console.log(card.id+":"+card.name)
            data.target =nextAlivePlayer.id
            data.cardId = card.id;

            this.playerUseCard(client.sessionId,nextAlivePlayer.id,card.id)
            this.state.playerMoved = true;
          } else {
            console.log("no card exist")
          } 
           
        }
      }

      if (data.action=="surrender") {

        //console.log("surrender!!")
        var player = this.state.players.get(client.sessionId)
        if (!player) return;
        //player.claimSurrender = false;
        if (player.getLife()<=1)  return;
        var surrenderCard:RoleCard 
        if (data.cardId =='')
          surrenderCard= player.getRandomRoleCard();
        else
          surrenderCard= player.roleCards.get(data.cardId);
        if (!surrenderCard) return;
        if (surrenderCard.used) return;
      
        player.pickRoleCard.clear();
        player.pickRoleCard.set(surrenderCard.id,surrenderCard);    
        player.claimSurrender = true;       
       
          
      }
      
      if (data.action=="infect") {
        
        var player = this.state.players.get(client.sessionId)
        if (!player) return;
        var nextAlivePlayer:Player = this.state.getNextAlivePlayer(client.sessionId); 
        if (!nextAlivePlayer) return;
        var infectCard = nextAlivePlayer.getRandomRoleCard();    // to change
        if (!infectCard) return;
        player.pickRoleCard.clear();
        player.pickRoleCard.set(infectCard.id,infectCard);
        console.log('infect :',+infectCard.id+":"+infectCard.name)          
      }

    }

    witchAction (client: Client, data: any) {
 
  
      var player = this.state.players.get(client.sessionId);
      if (player.witch === true) {
     
        this.state.witchMoved = true;
     
        if (data.action=="blackcat"){
          const playerIds = Array.from(this.state.players.keys());
          var player = this.state.players.get(client.sessionId)
          if (data.action=="blackCat"){
          
            var target = this.state.players.get(data.targetPlayerId);
            if (!target) return;
            if (target.alive){
              var card = this.state.handCardDeck.blackCatCard;
              target.buffCards.set(card.id,card);
            }
          }
        }
      } 

    }

    //from client  room.send("action",{'action':'protect','target':'123dd','cardId':''});
    sergantAction (client: Client, data: any) {

      var player = this.state.players.get(client.sessionId);
      if (player.sergant === true) {
     
       // this.state.sergantMoved = true;
     
        if (data.action=="protect"){
          this.state.sergantMoved = true;
          const playerIds = Array.from(this.state.players.keys());         
          var target = this.state.players.get(data.target);

          target = this.state.getNextAlivePlayer(client.sessionId); // to remove

          if (target){
            var card = this.state.handCardDeck.sergantProtectCard;
            this.state.players.forEach((player:Player) => {       
              if (player.buffCards.has(card.id))
                  player.buffCards.delete(card.id);
            })
            target.buffCards.set(card.id,card);
          } 
          //console.log("重新执行")
          this.runProgress(83,'');
        }
        
      }  else {
        console.log('你不是警长')
      }
      


      

    }

    
    log(sessionId:string,name:string){
      if (sessionId=='')  var sessionId = this.state.currentTurn;
      var player:Player = this.state.players.get(sessionId);
      var playerName = player.name;
     logger.silly(playerName+":"+name);

    }
    unLockPlayerMove(){
      this.state.playerMoved = false;
    }

    doAutoPlayerAction(){
        console.log('doAutoPlayerAction')
          this.doDeal('');      
    }

    doDeal(sessionId:string){
    
      if (this.state.playerMoved){
        this.runProgress(70,'')
        return;
      } 
      if (!sessionId) sessionId = this.state.currentTurn; 

      var player
      if (sessionId)
         player = this.state.players.get(sessionId)
      else 
        player = this.state.players.get(this.state.currentTurn);
      
      if (!player) {
        console.error("critical error")
        this.runProgress(70,'')
        return;
      }     
 
     
     /*
      var j = this.state.handCardDeck.cards.size;
      var k = 2;
      if (j<=1) {
        k =1;       
      }
      */
      var deck = this.state.handCardDeck;
      var infectCard =  deck.infectCard;
      var nightCard =  deck.nightCard;    
        for (var i =0;i<2;i++){ 
          //发牌
          
          var handCard:HandCard = this.state.handCardDeck.deal();
          console.log(i+":" ,handCard.name+":"+handCard.id)
          if (!handCard){
            console.error("critical error")
            return;
          }
          if (handCard.id == nightCard.id){
              this.runProgress(800,"")   
              return;
          }else  if (handCard.id == infectCard.id){
              console.log("infect !!!!!!!!!!")             
              deck.usedCards.set(handCard.id,handCard);
              this.setProgress(900)  
              this.runProgress(901,sessionId)   
              return; 
          } else {
              this.state.playerAddHandCard(player,handCard);  
              this.updateHandCardsInfo(player);
            
             this.updatePlayerInfo(player);
          }          

        }
//        player.changeState(); 
        this.setProgress(81);
        this.runProgress(70,'');



    }
    dealed(){
      this.runProgress(70,'')
    }
    //800
    nightComing(){
      console.log('黑夜来临!!!!!!!!!')
      var deck = this.state.handCardDeck;    
      deck.resetBlackCard();
      
      this.runProgress(801,'murder');
    }

    claimWin(){
      this.state.gameOver = true;

      this.cleanTimer();     

      console.log('**************************************************************************')
      console.log('******************************** Game Over *******************************')
      console.log('**************************************************************************')
 
      this.runProgress(910,'')
     
    }
    cleanTimer(){
      if (this.systemTimeout) {
        this.systemTimeout.clear();
      }
    }



    checkGameOver(run_pid_if_not_over:number){
      this.setProgress(999)
      logger.silly("结算是否结束,否则就:"+run_pid_if_not_over)
      var result = false;
      this.state.checkAlive();

      
 
      
      if (this.state.getPlayerAliveCount()==this.state.getWitchAliveCount()){    
        console.log("全是女巫:",+this.state.getPlayerAliveCount())    
        
        result = true;
      }   
      
      if (this.state.getPlayerAliveCount()==this.state.getCitizenAliveCount()){    
        console.log("全是平民:",+this.state.getPlayerAliveCount())    
       
        result = true;
      }      

      if (this.state.getPlayerAliveCount()==1){     
        console.log("只剩一人");   
         
         result = true;
      }   
      if (result == false){
        if (run_pid_if_not_over!=0)
          this.runProgress(run_pid_if_not_over,'');
      } else {
        this.claimWin();
      }

    }

    
    playerUseCard(playerId:string,targetId:string,cardId:string){
      var player = this.state.players.get(playerId);
      if (!player){
        this.broadcastInfo(playerId,"critical error")
          return;
      }
      var target = this.state.players.get(targetId);
      if (!target){
        this.broadcastInfo(playerId,"plz select target")
          return;
      }     
      var card =player.handCards.get(cardId);
      if (card==null) {
        this.broadcastInfo(player.id,"no card")
          return;
      }


      if (target.id == player.id){
        console.error("you can't use card on yourself")
        this.broadcastInfo(player.id,"you can't use card on yourself")
        return;
      }
      if (target.alive == false){
        this.broadcastInfo(player.id,"you can't use card on dead player")
        return;       
      }
     
     
      if (card.type=='red'){
          target.charged += card.value;
          if (target.charged>=7){
            // killed target one card;
              var roleCard :RoleCard = target.getRandomRoleCard();
                console.log(target.id+" killed "+roleCard.id+":"+roleCard.name)
                roleCard.used = true;
              var killer = this.state.players.get(playerId);              
              this.killInfo(killer,target,roleCard);
              target.charged =0;
             
          }
        
          player.handCards.delete(card.id);
          
          this.state.handCardDeck.usedCards.set(card.id,card);
          this.setProgress(82);
        
               
      }
   
      if (card.type=='blue'){
        if (target.hasSameBuffCard(card.name)){
          this.broadcastInfo(player.id,"target can't have same buff twice")
          return;
        }
        target.buffCards.set(card.id,card);                    
        player.handCards.delete(card.id);
        this.buffCheckInfo(target);
      } 
      
      
      if (card.type=='green'){

        if (card.name =="纵火"){
          
           this.state.playerDropAllHandCard(target);
           var content = "纵火";
           this.broadcastInfo("",content)  
        }
        if (card.name =="抢劫"){ 
          var content = "抢劫";
          this.broadcastInfo("",content)  
        }
       
        if (card.name =="拘留"){ 
          var content = "拘留";
          target.buffCards.set(card.id,card);
          this.buffCheckInfo(target);

           
          this.broadcastInfo("",content)  
        }
       
                         
        player.handCards.delete(card.id);
    
      //  this.state.playerUseCard = player.id +":"+ card.id;
        
      } 
     
      this.updatePlayerInfo(player);
      this.updatePlayerInfo(target);
      this.updateHandCardsInfo(player);
      this.checkGameOver(80);
      
  }

  killInfo(killer:Player,target:Player,roleCard:RoleCard){
    target.checkAlive();
    var content = killer.name +"翻开了"+target.name+'的一张身份牌:'+ roleCard.name;  
    this.broadcastInfo("",content)  
    this.updatePlayerInfo(target); 
    this.updatePlayerInfo(killer); 

   
  }

  surrenderInfo(killer:Player,target:Player,roleCard:RoleCard){
    target.checkAlive();
    var content = killer.name +"翻开了一张身份牌:"+ roleCard.name;  
   // var currentTurn = this.state.currentTurn;     
  //  this.broadcast("messages", {action:'surrender',player:killer.id,target:target.name,content:content});   

    this.broadcastInfo("",content)

  
    this.updatePlayerInfo(target);
    this.updatePlayerInfo(killer); 
  }
/*
  dealedCardInfo(player:Player,card:HandCard){    
    var content = player.name +"拿了一张牌:"+ card.name;  
    var currentTurn = this.state.currentTurn;     
    var size = player.handCards.size;
  
    this.broadcast("messages", {action:'dealed',player:player.id,content:content,size:size}); 
  }
  handCardUsedInfo(player:Player,target:Player,card:HandCard){    
    var content = player.name +"用了一张牌:"+ card.name;  +"在"+target.name
   
    var size = player.handCards.size;
  
    this.broadcast("messages", {action:'dealed',player:player.id,target:target.id,content:content,size:size}); 
  }
*/


  broadcastInfo(id:string,content:string){
    this.broadcast("messages", {action:'broadcast',id:id,content:content}); 
  }
  updatePlayerInfo(player:Player){
    this.state.playerUseCard = player.id +":"+ player.handCards.size;    
    var data = player.getPlayerBoard();
    var buffCards=  player.getBuffCards();
    data.buffCards= buffCards;
    logger.silly('updatePlayerInfo'+data.id)
    this.broadcast("messages", {action:'updatePlayer',id:player.id,data:data});   
    //this.buffCheckInfo(player);
  }
  updateHandCardsInfo(player:Player){
    var data = player.getHandCards();
    logger.silly('updateHandCardsInfo'+data.id)
    this.broadcast("messages", {action:'updateHandCards',id:player.id,data:data});   
   // this.buffCheckInfo(player)  
  } 
  // 玩家重连时调用
  reconnectTimerInfo(player:Player){
    var  leftTimeOut =this.state.timeOut - Math.ceil(this.systemTimeout.elapsedTime/1000);
    var progress:Progress = this.getProgress(this.state.pid);
    var data = {currentTurn:this.state.currentTurn,pid:this.state.pid,timeOut:this.state.timeOut,progressName:progress.name,leftTimeOut:leftTimeOut}

    this.broadcast("messages", {action:'reconnect',id:player.id,data:data});   
  }
  //每次pid变化时调用
  timerInfo(){  
    //  this.state.systemTimeout =  this.state.timeOut - Math.ceil(this.systemTimeout.elapsedTime/1000);
      var pid = String(this.state.pid);
      var progress:Progress = this.state.pids.get(pid)
      var id = String(progress.id);
      var name = String(progress.name);
      var leftTimeOut = 0;

      var playerId = this.state.currentTurn;
      var data = {currentTurn:this.state.currentTurn,pid:this.state.pid,timeOut:this.state.timeOut,progressName:name,leftTimeOut:this.state.timeOut}
      this.broadcast("messages", {action:'timer',id:playerId,data:data}); 
     // this.broadcast("messages", {action:'timer',}); 
  }

  buffCheckInfo(player:Player){
 
    var data = player.getBuffCards();
    this.broadcast("messages", {action:'buffCheckInfo',id:player.id,data:data}); 
  }






}
