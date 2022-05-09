import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema ,filter,filterChildren} from "@colyseus/schema";
import { AvatarState } from "../AvatarState";
//import {  RoleCard} from "./TowerRoomRoleCardState";
import { RoleCard,Icon} from "./TroubleRole";
import { HandCardDeck ,HandCard} from "./TowerRoomHandCardState";
import { Player,PlayerCharacter} from "./TowerRoomPlayerState";
import { MagicBook} from "./TowerRoomMagicBook";
import { MessageManager} from "./MessageManager";
import { Seat,SeatManager} from "../SeatState";


import roles from "./json/roles.json"
//const roles = require('./json/roles.json');
//const editions = require('./json/editions.json');
//const progressIds = require('./json/progressId.json');
//const game = require('./json/game.json');
import progressIds from "./json/progressId.json"

//import { Vector3 } from "../../helpers/Vectors";

export class Options extends Schema {
    @type("string") id: string;
    @type("number") robots: number;
    @type("boolean") playerChooseCharacter: boolean =true;
    @type("number") maxClients: number = 15;
    @type("number") roomId: number;
    @type("string") eid: string;
    @type("boolean") reconnect: boolean = false;
}

export class Progress extends Schema {
    @type("string") id: string;
    @type("number") pid: number;
    @type("string") name: string;
    @type("string") tip: string="";
    @type("string") func: string;
    @type("boolean") buff: boolean = false;
    @type("boolean") hand: boolean = false;
    @type("number") timeout: number=0;
    @type("number") leftTimeout: number;

    title():string{
        return  "("+this.id +")"+this.name +"<"+this.timeout+">";
    }
}


export class TowerRoomState extends Schema {

    @type(Progress) progress: Progress = new Progress();
    @type({ map: Progress }) pids = new MapSchema();
    @type(Options) options: Options = new Options();
    @type("string") adminId: string;
    @type("number") pid: number=0;
    @type("number") i: number=0;

    @type("boolean") start: boolean = false; 
    @type("boolean") enableReconnect: boolean = false; 
    @type({ map: Player }) players = new MapSchema();
    @type({ map: PlayerCharacter }) characters = new MapSchema();
    @type("number") seatIdx: number=0;

    @type("number") serverTime: number=0;
    @type("number") chatMessageCount: number=0;
    @type("number") reconnectCount: number=0;

    @type("number") maxClients: number=0;
    @type("number") maxSeats: number=16;
    @type("number") minSeats: number=5;
    @type("string") seed: string;   
    @type("string") winner: string; 
    @type("string") currentTurn: string; 

    @type("boolean") gameOver: boolean=false;
    @type("boolean") lockRoom: boolean=false;
    @type("boolean") pause: boolean=false;
    @type("number") systemTimeout: number=0;
    @type("number") seatChanged: number=0;   
    @type("number") seatReseted: number=0;   
    @type("number") seatUpdate: number=0;   
    @type("number") iconChanged: number;   
    @type(Icon) iconChangedData: Icon = new Icon();
    //@type("string") iconChangedData: string;   
    @type("number") progressChanged: number=0;   
    @type("number") playerCount: number=0;   
    @type("string") playerUseCard: string;      
    @type("string") playerAddCard: string;  
    @type("number") serverTimeout: number=0;   
    @type("number") nightDelay: number=5;   //晚上行动延时，建议60
    @type("number") duskDelay: number=1;  //黄昏提名阶段总时长，建议600 
    @type("number") duskDelayLeft: number=0; //不用动  
    @type("number") voteDelay: number=1; //投票延时，这已经包括了双方的发言时间    建议60 
   
    @type("number") dayDelay: number=1;   //白天公聊时长

    @type(["number"]) msgs: number[] = new ArraySchema<number>(0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0);

    @type({ map: RoleCard }) roles = new MapSchema();
    @type(HandCardDeck) handCardDeck: HandCardDeck = new HandCardDeck();
    @type(MagicBook) magicBook: MagicBook = new MagicBook();
   // @type(MessageManager) messageManager: MessageManager = new MessageManager();

    //@type(SeatManager) seatManager: SeatManager = new SeatManager();
    init(options:any){     
        console.log("options",this.options.roomId)        
        var data =progressIds;        
        var pids = this.pids;         
        for (var i=0;i<data.length;i++){
            var p = new Progress().assign(data[i]); 
            p.pid = Number.parseInt(p.id);
            this.pids.set(p.id,p);
        }
           
    }

 
    

    setPlayerCharacter(sessionId: string, characterId:string) {
        if (this.players.has(sessionId)) {    
          const player: Player = this.players.get(sessionId);
          const playerCharacter: PlayerCharacter = this.characters.get(characterId);
          player.playerCharacter = playerCharacter;
        }
    }


    getRandomPlayerAlive(exceptId:string){
        const arr = Array.from( this.players.keys());
        arr.sort(this.arandom); 
        for (var i =0;i<arr.length;i++){
            var id = arr[i];

            var player:Player= this.players.get(id);
            if (exceptId){
                if ((player.alive ==true) && (player.id!=exceptId)){
                    return player;
                }
            } else {
                if (player.alive ==true){
                    return player;
                }              
            }

        }
        return null;


    }
    getPlayerAliveCount(){

        var result =0;
        this.players.forEach((player:Player) => {             
            if (player.life>0){
                result ++;
            }
        });          
        return result;
    }
    getWitchAliveCount(){

        var result =0;
        this.players.forEach((player:Player) => {             
            if (player.life>0 && player.witch){
                result ++;
            }
        });          
        return result;
    }
    getCitizenAliveCount(){
        var result =0;
        this.players.forEach((player:Player) => {             
            if (player.alive  && player.witch ==false){
                result ++;
            }
        });          
        return result;

    }


    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];           
        arr.sort(this.arandom); 
  */
    arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
    }

    getRandomCharacterUnused(){
        var count = this.characters.size;                  
        const a = Array.from( this.characters.values());
        var character;       
        var finding = true;
        while(finding){
            var n = Math.floor(Math.random() *  count + 1)-1;
            character =a[n];
            if (character.used==false){
                finding = false;
              
                return  character;
            }
        }
    }  



    getPlayerAvatarState(sessionId: string): AvatarState {

        if (this.players.has(sessionId)) {    
          const player: Player = this.players.get(sessionId);
          return player.avatar;
        }
    
        return null;
    }
    

    getNextAlivePlayer(fromThisPlayerId:string):Player{
        if (!fromThisPlayerId){
            console.error("no fromThisPlayerId")
        }
       // var from = fromThisPlayerId;
        let player:Player;       
        var finding = true;
        while(finding){
         

            player = this.getNextPlayer(fromThisPlayerId);
            if (!player){
                console.error("no player")
            }
            if (player.alive==true){
                finding = false;
             
                return  player;
            } else {
                fromThisPlayerId = player.id;
            }
        }

        
    }
   
    getNextPlayer(fromThisPlayer:string):Player{
        if (!fromThisPlayer){
            console.error("no fromThisPlayerId")
        }
       var seat= this.magicBook.seatManager.get(fromThisPlayer);
       var nextSeatId =seat.next;
       var player:Player = this.players.get(nextSeatId);
       return player;
    }
    getPreviousPlayer(fromThisPlayer:string):Player{
        if (!fromThisPlayer){
            console.error("no fromThisPlayerId")
        }
         var seat= this.magicBook.seatManager.get(fromThisPlayer);
         var previousSeatId =seat.previous;
         var player:Player = this.players.get(previousSeatId);
         return player;
    }
    playerAddHandCard(player:Player,handCard:HandCard){
        if (player && handCard){
            player.handCards.set(handCard.id,handCard);
          //  player.hands =  player.handCards.size;
            this.playerAddCard = player.id +":"+ player.handCards.size;
            
         
        }
    } 
   
/*

    deletePickCard(){
        this.players.forEach((player:Player) => {  
          var cards = Array.from(player.pickRoleCard.keys());
          var cardId = cards[0];
          var card = player.pickRoleCard.get(cardId);  
    
            this.players.forEach((p:Player) => {
                if (p.id!= player.id){
                   if (p.roleCards.has(card.id)){
                     p.roleCards.delete(card.id)
                     console.log("delete pickcard ",card.id)                 
                   }
                }  
            })
          

          player.pickRoleCard.clear();
  
        })
    }
    */
    checkAlive(){
        this.players.forEach((player:Player) => {
            player.checkAlive()
        })
    }
    checkRole(){
        this.players.forEach((player:Player) => {
            player.checkRole();
            player.reportRole();
        }); 
    }
    

    /****************************************  about Seat
     * 
     * 

    */
    changeSeat(a:number,b:number){
      this.magicBook.seatManager.changeSeat(a,b);  
      this.seatChanged = new Date().getTime();
    }

    playerChangeSeat(a:number,b:number){
        console.log("playerChangeSeat")
        this.changeSeat(a,b);
    }



    sortSeat(){
        this.magicBook.seatManager.sortSeat();
    }




    setSeat(){

        this.magicBook.seatManager.seats.forEach((seat:Seat) => {
            var player:Player = this.players.get(seat.playerId);
            if (player)
                 seat.name =  player.name;

        })       
        
    }

    getRandomPlayerNoSeat():Player{
        var result : Player;
        let arr = Array.from(this.players.values())
  
        let res1=arr.filter((item,index,array)=>{
            return ((item.sitted == false) &&(!item.admin))
        });
       // console.log('res1',res1)
        if (res1.length>0){
            var n =Math.floor((Math.random() * res1.length) + 0);
            result  = res1[n];
            return res1[n];
        } else return result

        

    }
    


    setMagicBook(playerCount:number,wishRoleFirst:boolean){
      


    }
    setPlayerConnected(playerId:string,isConnected:boolean):string{
        
        var player = this.players.get(playerId);
        if (!player) return;
        if ((isConnected==false) &&(player.connected==true)){
            player.reconnectCount ++;
        }            
        player.connected = isConnected;
        var msg ="";
        if (isConnected== true)
            msg =player.name+" 重新连上了!";
        else 
             msg =player.name+" 断线了!";
          
        var seat:Seat = this.magicBook.seatManager.getSeatByPlayerId(player.id);
        if (seat) seat.connected = isConnected;

        return msg;
    }
    playerReachMaxReconnect(playerId:string,maxReconnect:number):boolean{
        var result = false
        var player:Player = this.players.get(playerId);
        if (!player) return;
        if (player.reconnectCount>=maxReconnect)
            result = true;
            
        return result;
    }
    alllowPlayer(playerId:string){
        var player:Player = this.players.get(playerId);       
        if (player) 
             player.connected = true;
    }
    dropPlayer(playerId:string){

        var player:Player = this.players.get(playerId);
       
        if (player) 
             player.connected = false;


       
    }
    deletePlayer(playerId:string){
        
        if (this.players.has(playerId))
             this.players.delete(playerId);



       
    }


}