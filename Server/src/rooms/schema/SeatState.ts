import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema,filter} from "@colyseus/schema";
import { Player,PlayerCharacter} from "./tower/TowerRoomPlayerState";
//import { RoleCard } from "./tower/TowerRoomRoleCardState";
import { RoleCard,Icon } from "./tower/TroubleRole";
/*
export class Test extends Schema {
  @type("string") id: string;
  @type("string") sessionId: string;
  @type("string") name: string;
  @type("string") seatId: string="";  


  
  @filter(function(
      this: Test, // the instance of the class `@filter` has been defined (instance of `Card`)
      client: Client, // the Room's `client` instance which this data is going to be filtered to
      value: Test['roleCard'], // the value of the field to be filtered. (value of `number` field)
      root: Schema // the root state Schema instance
  ) {
      return  this.sessionId === client.sessionId;
  })
  @type(RoleCard) roleCard: RoleCard = new RoleCard();
  
}
*/


export class Seat extends Schema {
    @type("string") id: string;
    @type("string") sessionId: string;
    @type("string") playerId: string;
    @type("string") playerName: string;
   
    @type("boolean") robot: boolean = false;
    @type("string") name: string;
    @type("number") idx: number=0;

    @type("boolean") connected: boolean=false;
    @type("boolean") ready: boolean=false;
    @type("boolean") locked: boolean=false;
    @type("boolean") alive: boolean=true;
    @type("boolean") dead: boolean=false;
    @type("number") deadRound: number =0;
    @type("number") pendingSessionTimestamp: number;
    @type("string") previous: string="";
    @type("string") next: string="";
    @type({ map: Icon }) icons = new MapSchema();  

    @filter(function(
      this: Seat, // the instance of the class `@filter` has been defined (instance of `Card`)
      client: Client, // the Room's `client` instance which this data is going to be filtered to
      value: Seat['role'], // the value of the field to be filtered. (value of `number` field)
      root: Schema // the root state Schema instance
  ) {
      return ((this.sessionId === client.sessionId)&&(this.sessionId !='')&&(this.sessionId!=undefined));
  })
  //@type(RoleCard) role = new RoleCard();
   @type(RoleCard) role: RoleCard = new RoleCard();
  




}

export class SeatManager extends Schema {
  @type("boolean") lock: boolean=false;
  @type({ map: Seat }) seats = new MapSchema();
  @type("number") maxSeats: number=1;
  @type("number") ready: number=0;
  @type("number") lockedCount: number=0;
  @type("number") aliveCount: number=0;


  get(seatId:string){
    return this.seats.get(seatId);
  }
    /*
        var arr = [1,2,3,4,5,6,7,8,9,10];           
        arr.sort(this.arandom); 
  */
  arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
  }

  playerChangeSeat(player:Player,seatId:string):boolean{
    var result = false;
    var seat = this.seats.get(seatId);

    var playerSeat =  this.getSeatByPlayerId(player.id);

    
    if (seat.locked) return result;
    if (playerSeat) {
       console.log("playerSeat",playerSeat.id)
       player.stand();
       this.emptySeat(playerSeat);
    }
    if (seat){
      player.sit(seat.id);
      this.takeSeat(player,seat.id);
    }



    

    return true;
    

  }

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
        var _a = seatA;
        var _b = seatB;
        
        seatA.playerId = _b.playerId;
        seatA.playerName = _b.playerName;
        seatA.robot = _b.robot;
        seatB.playerId = _a.playerId;
        seatB.playerName = _a.playerName;
        seatB.robot = _a.robot;  
  
      //  seatB.idx = _a;  
    }

    this.sortSeat();
    this.setSeat();
    
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
  /**设定座位前后关系
   * 
   */
  //remove
  setSeat(){

    const a = Array.from( this.seats.keys());
    const b = Array.from( this.seats.values());
    for (var i=0;i<a.length;i++){
        var j = i+1;
        var k = i-1;
        
        if (j>=a.length) j = 0;
        if (k<0) k =a.length-1;        
        this.seats.get(a[i]).next =b[j].playerId;
        this.seats.get(a[i]).previous =b[k].playerId;
        
     }  
     
    
  }
  /**
   * 
   * @returns 随机座位排序的array
   */
  
   getRandomArray(){
     const arr = Array.from( this.seats.keys());
     arr.sort(this.arandom); 
     return arr;
  }

  //增加空位到最大值
  addEmptySeats(maxSeats:number){
   // var j = this.lockedCount;
    var j = this.seats.size;
    for (var i=1;i<=maxSeats;i++){

      let seat = new Seat().assign({
        id: String(i),          
        idx:i
      
      });
      this.seats.set(seat.id,seat);  
    }   
   

  }



  takeSeat(player:Player,seatId:String){
     
    if (!player) return;
    if (!seatId) return;
    var _seatId = String(seatId)
    var seat:Seat = this.seats.get(_seatId)
    
    
     if (!seat) return
     if (seat.ready) return;
     if (!seat.locked){
      // this.removeLastSeat(player)
        player.sitted = true; 
        player.seatId = seat.id;
      //  console.log("player.sessionId",player.sessionId)
    
        seat.sessionId = player.sessionId;
        seat.locked = true;
        seat.connected = true;
        seat.playerId = player.id;
        seat.playerName = player.name;
        seat.robot = player.robot;

      // console.log("takeSeat done :"+player.id,"-",seatId)
        //this.countLocked();
       // this.countAlive();
     }
    // this.sort();
  }
  
/*
  leaveSeat(seatId:String){
    if (!seatId) return;


  }
*/
  getEmptySeat():Seat{
    var seat:Seat;
    for (var i=1;i<this.maxSeats;i++){
      var str = String(i);
      var _seat = this.seats.get(str);
      if (_seat.locked == false ) return _seat;
 
    }
    return seat;
  }
  playerOnSeat(player:Player):Seat{
    var result :Seat;
    let arr = Array.from(this.seats.values())
  
    arr.forEach((seat:Seat) => {   
      if(seat.playerId == player.id){
        //console.log("got it")
        seat.sessionId = player.sessionId;
        result = seat;
      }
    })
    
    return result;
  } 
  emptySeat(seat:Seat){
    if (!seat) return;
    seat.locked = false;
    seat.playerId = null;
    seat.connected = false;
    seat.playerName = null
    seat.ready = false;
    seat.alive = true;
    seat.previous = null;
    seat.next = null;
    seat.sessionId = null;
    this.seats.set(seat.id,seat);
  }
  disconnectSeat(seat:Seat){
    if (!seat) return;   
    seat.connected = false;
    this.seats.set(seat.id,seat); 
  }


  getSeatByPlayerId(playerId:string):Seat{
   // console.log("getSeatByPlayerId playerId:",playerId)
    var result:Seat ;
    let arr = Array.from(this.seats.values())
  
    let res1=arr.filter((item,index,array)=>{
        return (item.playerId == playerId)// &&(item.edition =="tb")
    });
    if (res1.length==1){
      return res1[0]
    } else {
      //console.error("getSeatByPlayerId critical error" + res1.length);
      return result
    }



    return result;

  }
  execute(seatId:string){
    if (!seatId) return

    var seat = this.seats.get(seatId)
    if (seat){
        seat.alive =false;
        this.seats.set(seat.id,seat);
    }else {
      console.error("no seat to execute")
    }
  }

  getSeatBySessionId(sessionId:string):Seat{
    var result:Seat ;

    let arr = Array.from(this.seats.values())
  
    let res1=arr.filter((item,index,array)=>{
      return (item.sessionId == sessionId)// &&(item.edition =="tb")
     });
     console.warn("res1.length:",res1.length)
     if (res1.length==1){
      
      return res1[0]
    } else {
      console.error("getSeatBySessionId critical error"+ res1.length);
      return result
    }

  }




}