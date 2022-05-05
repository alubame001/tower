
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { AvatarState } from "./AvatarState";
import { RoleCardDeck ,RoleCard} from "./RoleCardState";
import { HandCardDeck ,HandCard} from "./HandCardState";
import { Player,PlayerCharacter} from "./PlayerState";
import { Seat} from "./SeatState";
import { Vector3 } from "../../helpers/Vectors";


export class Progress extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") func: string;
    @type("boolean") buff: boolean = false;
    @type("boolean") hand: boolean = false;
    @type("number") timeOut: number=0;
}
export class Condition extends Schema {
    @type("string") id: string;
    @type("string") filed: string;
    @type("string") compare: string;
    @type("string") value: string;

}
export class Option extends Schema {
    @type("string") id: string;
    @type("string") content: string;
}
  
export class Event extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") content: string; 
    @type(Player) targetPlayer: Player = new Player();
    @type({ map: Condition }) source = new MapSchema();
    @type({ map: Condition }) target = new MapSchema();
}

export class Evidence extends Schema {
    @type("string") id: string;
    @type("string") content: string;
}
export class Result extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") content: string; 
    @type(Evidence) evidence: Evidence = new Evidence();
}


export class StoryRoomState extends Schema {
    @type({ map: Player }) players = new MapSchema();
    @type({ map: Seat }) seats = new MapSchema();
    @type({ map: PlayerCharacter }) characters = new MapSchema();
    @type("number") seatIdx: number=0;
    @type("number") pid: number=0;
    @type("string") pidName: string;
    @type("number") serverTime: number=0;
    @type("number") chatMessageCount: number=0;
    @type("number") reconnectCount: number=0;
    @type("number") timeOut: number=0;
    @type("number") maxClients: number=0;
    @type("number") maxSeats: number=12;
    @type("number") minSeats: number=2;
    @type("string") seed: string; 
    @type("boolean") playerChooseCharacter: boolean= false; 
    @type("string") winner: string; 
    @type("string") currentTurn: string; 
    @type("boolean") witchMoved: boolean = false; 
    @type("boolean") sergantMoved: boolean = false; 
    @type("boolean") playerMoved: boolean=false;
    @type("boolean") gameOver: boolean=false;
    @type("number") systemTimeout: number=0;
    @type("number") seatChanged: number=0;   
    @type("string") playerUseCard: string;      
    @type("string") playerAddCard: string;  
   // @type("number") lastBuffTime: number=0;  
   //@type([Player]) players2: Player[] = new ArraySchema<Player>();
   
   //  @type(["number"]) board: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0, 0, 0, 0);
    @type({ map: Progress }) pids = new MapSchema();
    @type({ map: Evidence }) evidences = new MapSchema();
    @type(RoleCardDeck) roleCardDeck: RoleCardDeck = new RoleCardDeck();
    @type(HandCardDeck) handCardDeck: HandCardDeck = new HandCardDeck();
   
    init(){

        var data =[
            {id:'10',name:'加入房间'    ,timeOut:1,func:''},
            {id:'20',name:'座位调整'    ,timeOut:2,func:'doAutoSeatReady'},
            {id:'25',name:'人物选单'    ,timeOut:1,func:'doAutoSelectCharacter'},
            {id:'30',name:'设定参数'    ,timeOut:1,func:'setRoomValue'},
            {id:'40',name:'发身份牌'    ,timeOut:1,func:''},
            {id:'50',name:'发手牌'      ,timeOut:1,func:''},
            {id:'60',name:'女巫放黑猫'  ,buff:true,timeOut:1,func:'doAutotWitchAction'},
            {id:'61',name:'blackcat   ',buff:true,timeOut:1,func:'firstBlackCat'},
            {id:'70',name:'下个玩家'    ,buff:true,timeOut:1,func:'nextTurn'},
            {id:'80',name:'等待玩家行动',buff:false,timeOut:5,func:'doAutoPlayerAction'},
            {id:'81',name:'已抽牌',timeOut:1,func:'dealed'},
            {id:'82',name:'已出牌',buff:false,timeOut:1,func:'dealed'},
            {id:'83',name:'被扣',timeOut:1,func:'cuffed'},
            {id:'800',name:'黑夜了   '  ,timeOut:1,func:'nightComing'},
            {id:'801',name:'女巫剌杀'   ,timeOut:1,func:'doAutotWitchAction'},          
            {id:'802',name:'警长保护'   ,timeOut:1,func:'doAutoSergantAction'},          
            {id:'803',name:'玩家自首'   ,buff:false,timeOut:1,func:'doAutoSurrenderAction'},
            {id:'804',name:'自首结算' ,timeOut:1,func:'checkSurrenderSucess'},
            {id:'805',name:'警长保护了' ,timeOut:1,func:''},
            {id:'806',name:'没有警长'   ,timeOut:1,func:''},
            {id:'807',name:'没有黑猫'   ,timeOut:1,func:''},          
            {id:'808',name:'结算死亡'    ,timeOut:1,func:'checkMurderScuess'},
            {id:'809',name:'因为自首保命了',timeOut:1,func:''},
            {id:'900',name:'抽到传染'    ,timeOut:1,func:''},
            {id:'901',name:'开身份牌'    ,timeOut:1,func:'doAutoKillerAction'},
            {id:'902',name:'玩家进行传染',timeOut:1,func:'doAutotInfectAction'},
            {id:'903',name:'传染结算',timeOut:3,func:'checkInfectSucess'},
            {id:'999',name:'结算是否结束',timeOut:1,func:'doCheckGameOverAction'},
            {id:'910',name:'游戏结束'   ,timeOut:1,func:'doAutoGameOverAction'},
            {id:'911',name:'公布结果'   ,timeOut:1,func:'doAutoReportScore'},
            {id:'912',name:'重新开始'   ,timeOut:1,func:'doAutoRestart'},
        ]

        var pids = this.pids;  
        for (var i=0;i<data.length;i++){
            var p = new Progress().assign(data[i]); 
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

    getPlayerOwnBlackCat():Player{
       var result:Player ;
       var blackcatCard = this.handCardDeck.blackCatCard;
     
        this.players.forEach((player:Player) => { 
             var buffCards = player.buffCards;
             var p = player;

             
             buffCards.forEach((card:HandCard) => {              
                if (card.id==blackcatCard.id){                  
                    result = player;                    
                }
             })

        }); 
        
        return result;
    }
    getSergant():Player{


        var p :Player ;
        this.players.forEach((player:Player) => { 
            player.checkRole();
           // console.log(player.name+" 身份是:"+player.getRole());
            /*
            if (player.sergant){
                console.log(player.name+" 是警长!!!!");
                return player;     
            }
            */
            if (player.alive && player.sergant){  
                console.log(player.name+" 是警长!!!!");             
                   p = player;
                                
            }
        }); 
        
        return p;
    }

    getRandomPlayerAlive(exceptId:string){
        /*
        var count = this.players.size;                  
        const a = Array.from( this.players.values());
        var player;       
        var finding = true;
        while(finding){
            var n = Math.floor(Math.random() *  count + 1)-1;
            player =a[n];
        
            if (exceptId!=player.id) {    
                if (player.alive == true){
                    finding = false;
                   
                    return  player;
                }
            }
        }
        */
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

       var seat= this.seats.get(fromThisPlayer);
       var nextSeatId =seat.next;
       var player:Player = this.players.get(nextSeatId);
       return player;
    }
    getPreviousPlayer(fromThisPlayer:string):Player{
        // var playerId= this.seats.get(fromThisPlayer)
         var seat= this.seats.get(fromThisPlayer);
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
        if (a==b) return;
        if (a<=-1) return;
        if (b<=-1) return;
    

        var seatA :Seat;
        var seatB :Seat;
        
        const seatArray = Array.from( this.seats.values());  
        this.seats.forEach((seat:Seat) => {

            var idx = seat.idx;
            if (idx == a){
                seatA = seat;
            }
            if (idx == b){
                seatB = seat;
            }
        })

        if (seatA && seatB){
            var _a = seatA.idx;
            var _b = seatB.idx;
            seatA.idx = _b;
            seatB.idx = _a;  
        }
    
      this.sortSeat();
      this.setSeat();
      this.seatChanged = new Date().getTime();
    }

    sortSeat(){
        const seatArray = Array.from( this.seats.values());  
        this.seats.clear();
       // console.log('seatArray',seatArray)
        for (var j=0;j<1000;j++){
        
                for (var i =0;i<seatArray.length;i++){                    
                    var seat = seatArray[i];
                    if (seat.idx ==j){
                        console.log(seat.id,seat.idx,seat.name)
                        this.seats.set(seat.id,seat);
                    }

                }
         }

    }




    setSeat(){

        const a = Array.from( this.seats.keys());
        const b = Array.from( this.seats.values());
        for (var i=0;i<a.length;i++){
            var j = i+1;
            var k = i-1;
            
            if (j>=a.length) j = 0;
            if (k<0) k =a.length-1;
            
          //  this.seats.get(a[i]).next =a[j];
          //  this.seats.get(a[i]).previous =a[k];
            
            this.seats.get(a[i]).next =b[j].playerId;
            this.seats.get(a[i]).previous =b[k].playerId;
            
        }  
        this.seats.forEach((seat:Seat) => {
            var player:Player = this.players.get(seat.playerId);
            if (player)
                 seat.name =  player.name;

        })       
        
    }

   playerDropAllHandCard(player:Player){
       
        if (!player) return;
        player.handCards.forEach((card:HandCard) => {
           card.used = true;             
           this.handCardDeck.usedCards.set(card.id,card)
        });
        player.handCards.clear();
        player.hands =0;

       
    }

/*
    setLastBuffTime(){       
        this.lastBuffTime = this.serverTime;
    }
*/
}