import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema,filter} from "@colyseus/schema";


import { Seat,SeatManager} from "../SeatState";
import { MagicBook,Option} from "./TowerRoomMagicBook";
import {Nominate,NominateManager} from "../NominateState";
//import { Action} from "./TowerRoomMagicBook";
import { HandCardDeck,HandCard} from "./TowerRoomHandCardState";
import {ActionManager,Action } from "./TowerRoomActionState";
import {RoleManager} from "./TowerRoomRoleManager";



import options from "../../../config/mikro-orm.config";
import { realpath } from "fs";
import { createDecipheriv } from "crypto";
//const editions = require('./json/editions.json');
//const roles = require('./json/roles.json');
//const game = require('./json/game.json');



export class Role extends Schema {

    @type("string") id: string;
    @type("string") sessionId: string;
    @type("string") name: string;
    @type("string") edition: string;
    @type("string") team: string;    
    @type("number") firstNight: number;
    @type("string") firstNightReminder: string;
    @type("number") otherNight: number;

    @type("string") otherNightReminder: string;  
 
    @type("string") abilityId: string;  
    @type("string") ability: string;  

    @type("string") seatId: string="";  
    @type("string") realSeatId: string;  
    @type("string") playerId: string;  
    @type("number") idx: number;   // for seat arrange
    @type("boolean") locked:boolean=false;
    @type("boolean") alive: boolean=true;
    @type("boolean") lie: boolean=false;
    
    
    @type("boolean") used: boolean=false;
    @type("boolean") witch: boolean=false;
    @type("boolean") sergant: boolean=false;
    @type("boolean") citizen: boolean=false;
    @type("boolean") picked: boolean=false;


    @type("boolean") drunked: boolean=false;    
    @type("boolean") poisoned: boolean=false;   
    @type("boolean") dead: boolean=false;   

    @type("number") poisonPeriod: number;
    @type("boolean") marked: boolean=false;  //used for fortuneteller
    @type("boolean") diablePreview: boolean=false;  //用於标示，是否可预选
    @type("string") voteOnly: string;        //used for butler 
    @type("string") statu: string;        //used for butler 

    @type("boolean") triggerAfterDeath: boolean=false;
    @type("boolean") enableSkill: boolean=true; // for dead boss
    
    @type("number") minion: number;
    @type("number") outsider: number;
    @type("number") townsfolk: number;
    
    @type("boolean") wish: boolean=false;  //用於角色是否因为玩家希望所产生
    @type("boolean") isMayor: boolean;  //市长
    @type("boolean") isVirgin: boolean; // for virgin

    @type("boolean") revealed: boolean; // 
    @type("string") ownerId: string;        


    @type("number") deadRound: number;  

    @type(["string"]) possibility: string[] =   new ArraySchema<string>('','','');
  //  @type(["string"]) message: string[] =   new ArraySchema<string>();
    //@type(["string"]) targetIds: string[] =   new ArraySchema<string>();
    @type(["string"]) targets: string[] =   new ArraySchema<string>();
    @type("number") target: number=0;

    @type({ map: HandCard }) buffs = new MapSchema();

    /*
    @filter(function(
        this: Role, // the instance of the class `@filter` has been defined (instance of `Card`)
        client: Client, // the Room's `client` instance which this data is going to be filtered to
        value: Role['seatId'], // the value of the field to be filtered. (value of `number` field)
        root: Schema // the root state Schema instance
    ) {
        return  this.sessionId === client.sessionId;
    })
    */


    doAutoFunction(func:string,value:any){
    
        var f;
        if (value)
        var f = eval("this."+func + "(value);");//hello world!
        else {
        var f = eval("this."+func + "();");
        }
    }

    title():string{
        
        if (this.realSeatId)    
            return "("+this.realSeatId+")"+this.name 
         else 
            return "("+this.seatId+")"+ this.name 
  
    }

    seat():string{
        
        if (this.realSeatId)    
            return  this.realSeatId+"号"
         else 
            return  this.seatId+"号"
  
    }
    status():string{
        var msg ="";
        if (this.drunked) msg ="<酒醉>"
        if (this.poisoned) msg =this.statu+"<中毒>"
        return msg;

    }




    handleStatu(book:MagicBook):boolean{
        var result = false;
        this.lie = false;
        this.statu ="";
        if ((this.poisoned)||(this.drunked)){
            
            if (this.drunked) this.statu ="<酒醉>"
            if (this.poisoned) this.statu =this.statu+"<中毒>"
            if (this.poisoned) book.addMessage(this.title()+"被毒了，无法使用技能。讯息一定错误")
          
            result = true;
            this.lie = true;
            if (this.drunked){
                if (book.dropDice(true)){
                    this.lie = false ;
                    book.addMessage(this.title() +"酒醉了，无法使用技能。检定通过，讯息正确")
                } else {
                    this.lie = true ;
                    book.addMessage(this.title() +"酒醉了，无法使用技能。讯息大概率错误")
                }

            }
        } 
        return result;

    }

    isTownsfolk(){
        
        var result = false;
        if (this.team=="townsfolk"){
          result = true; 
        }         
        return result;
    }

    isEvil(){
        
        var result = false;
        if ((this.team=="demon")||(this.team=="minion")){
          result = true; 
        }         
        return result;
    }



    isGood(){
        var result = false;
        if ((this.team=="outsider")||(this.team=="townsfolk")){
          result = true; 
        }         
        return result;
    }   



    /**
     * 
     *  
     * 
     */

   


    


}
/*
export class MyRoom extends Schema {
    @filterChildren(function(client: any, key: string, value: RoleCard, root: MyRoom) {
        return (value.ownerId === client.sessionId) || value.revealed;
    })
    @type({ map: RoleCard })
    cards = new MapSchema<RoleCard>();
}
*/
