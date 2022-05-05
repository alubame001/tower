import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema,filter} from "@colyseus/schema";


import { Seat,SeatManager} from "../SeatState";
import { MagicBook,Option} from "./TowerRoomMagicBook";
import {Nominate,NominateManager} from "../NominateState";

import { HandCardDeck,HandCard} from "./TowerRoomHandCardState";

import {ActionManager,Action } from "./TowerRoomActionState";


export class Icon extends Schema {
    @type("string") id: string; //seatId
    @type("string") seatId: string; //seatId
    @type("string") iconSeatId: string; //seatId
    @type("string") roleId: string;
    @type("string") team: string;
  }

export class RoleCard extends Schema {
    @type("string") id: string;
    @type("string") sessionId: string;
    @type("string") name: string;
    @type("string") replaceName: string;
    @type("string") edition: string;
    @type("string") team: string;    
    @type("number") firstNight: number;
    @type("string") firstNightReminder: string;
    @type("number") otherNight: number;

    @type("string") otherNightReminder: string;  
 
    @type("string") abilityId: string;  
    @type("string") ability: string;  

   
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
    @type("boolean") isMayor: boolean =false;  //市长
    @type("boolean") isVirgin: boolean =false; // for virgin

       
    @type("boolean") robot: boolean =false;  //

    @type("number") deadRound: number;  

    @type(["string"]) possibility: string[] =   new ArraySchema<string>('','','');
    @type(["string"]) messages: string[] =   new ArraySchema<string>();
    @type(["string"]) targets: string[] =   new ArraySchema<string>();
    @type("number") target: number=0;

    @type({ map: HandCard }) buffs = new MapSchema();  



   
    @filter(function(
        this: RoleCard, // the instance of the class `@filter` has been defined (instance of `Card`)
        client: Client, // the Room's `client` instance which this data is going to be filtered to
        value: RoleCard['seatId'], // the value of the field to be filtered. (value of `number` field)
        root: Schema // the root state Schema instance
    ) {
        return  this.sessionId === client.sessionId;
    })
    @type("string") seatId: string="";  



    title():string{
        var statu ="";
        var seatId =  this.seatId;
        if (this.realSeatId) seatId = this.seatId

        if (this.drunked) 
            statu ="<酒鬼>" 
        return "("+seatId+")"+ this.name +statu
  
    }

    seat():string{
        var seatId =  this.seatId;
        if (this.realSeatId) seatId = this.seatId
            return  seatId+"号"
  
    }
    status():string{
        var statu ="";
        if (this.drunked) statu ="<酒鬼>"
        if (this.poisoned) statu =statu+"<中毒>"
        return statu;

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
            this.lie = result;
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



//skill(book:MagicBook){}
/*
    
    @filter(function(
        this: RoleCard, // the instance of the class `@filter` has been defined (instance of `Card`)
        client: Client, // the Room's `client` instance which this data is going to be filtered to
        value: RoleCard['used'], // the value of the field to be filtered. (value of `number` field)
        root: Schema // the root state Schema instance
    ) {
        return  this.sessionId === client.sessionId;
    })
*/



finalMessage(book:MagicBook,real:string,wrong:string){
    if (this.lie==true){


      
        book.addPrivateMessage(this,wrong,this.title()+wrong+"(伪)");
    } else {


        if (real=="") return;  
     
        book.addPrivateMessage(this,real,this.title()+real);
        
    }
}

addMessage(msg:string){
  
    this.messages.push(msg)
}


checkDemonBuff(book:MagicBook):boolean{

   
    var immune = false;
    var shield = false;
    var result = false;
    var demon = this.buffs.get('imp');
    var monk  = this.buffs.get('monk');
    if (demon){

        if(this.id=="soldier"){
            if ((this.poisoned)||(this.drunked)){
                book.addMessage(this.title()+ "无法使用被动技能")
            } else {
                book.addMessage(this.title()+ "发动了被动技能")
                immune = true;
            }
        }
      
        if(monk){     
            book.addMessage("僧侣保护了"+this.title()+" <平安夜>")
            shield = true;
        } 

        if (shield||immune){
            
        }else {
            let nominate = new Nominate().assign({
                id: this.id,
                name :this.name,
                targetSeatId :this.seatId,    
                starterSeatId :demon.seatId,
                round :book.round,
                closed :true,
                method:"buff",
                executed :false                        
              });
            book.addVictime(nominate); 
                            
            this.deadRound = book.round;
            this.claimDeath();
            //book.addMessage(real);
            result = true;
        }





    
    }
    if (this.buffs.has('imp')) this.buffs.delete('imp')
    if (this.buffs.has('monk')) this.buffs.delete('monk')
    return result;

}
    claimDeath(){
    
     //   book.addPrivateMessage(this,"你进入死亡状态",this.title()+"死亡")

        this.dead = true;
        this.alive = false;
 
        
    }
    claimAlive(){
 
        this.dead = false;
        this.alive = true;       
    }
    getReal(book:MagicBook,exceptIds:any,team1:string,team2:string):string{
       
        var result =""

        var a:RoleCard=  book.getOneRandomRole(exceptIds,team1,true,true); 
        if (!a) return result;
        exceptIds.push(a.id);
        var b:RoleCard=  book.getOneRandomRole(exceptIds,team2,true,true); 
        
        var showName = a.name;
        if (this.id=="investigator")
           if (a.id=="drunk")
             showName = a.replaceName;
        

        if (Number(a.seatId)<Number(b.seatId))
            result = a.seatId+ "或"+ b.seatId+"是" + showName
        else 
            result = b.seatId+ "或"+ a.seatId+"是" + showName 
            console.warn("getReal.......................")
            console.warn(this.title()+":"+result)
        return result;
    }
    getWrong(book:MagicBook,exceptIds:any,team1:string,team2:string):string{
        var result =""

        var c:RoleCard=  book.getOneRandomRole(exceptIds,team1,true,false); 
        if (!c) {
            c =  book.getOneRandomRole(exceptIds,team1,true,true); 
        }       
        exceptIds.push(c.id);
        var a:RoleCard=  book.getOneRandomRole(exceptIds,"",true,true);     
        exceptIds.push(a.id);   
        var b:RoleCard=  book.getOneRandomRole(exceptIds,"",true,true);        

        if (Number(a.seatId)<Number(b.seatId))
            result = a.seatId+ "或"+ b.seatId+"是" + c.name
        else 
            result = b.seatId+ "或"+ a.seatId+"是" + c.name        
            console.warn("getWrong.......................")
            console.warn(this.title()+":"+result)
        return result;
    }

    changeRoleSkill(book:MagicBook):RoleCard{
        var result:RoleCard;
        result = this;
        
     //   var realSeatId = this.seatId; //用此来标记原来的座位
        this.realSeatId = this.seatId; //用此来标记原来的座位
        if (this.id=="recluse"){
        
        
            if (this.poisoned) {
                book.addMessage(this.title()+"中毒了，无法改变身份");
                return result;
            }            
            if (book.yesOrNo(false)){        
                var exceptIds =[this.id];
                var a:RoleCard
                if (book.yesOrNo(false)){
                    a=  book.getOneRandomRoleInTeamm(exceptIds,'minion');                   
                    a.realSeatId =this.realSeatId
                }else{
                    a=  book.getOneRandomRoleInTeamm(exceptIds,'demon');
                    a.realSeatId =this.realSeatId
                } 
                book.addMessage(this.title()+"发动技能改变身份为"+a.name +book.getLuck())
                result = a;
            } else {

                book.addMessage(this.title()+"发动技能改变身份失败" +book.getLuck())
                result = this;
            }

        }

        if (this.id=="spy"){           
        
            if (this.poisoned) {
                book.addMessage(this.title()+"中毒了，无法改变身份");
                return result;
            }            
            if (book.yesOrNo(false)){
        
                var exceptIds =[this.id];
                var a:RoleCard
                if (book.yesOrNo(false)){
                    a=  book.getOneRandomRoleInTeamm(exceptIds,'townsfolk');       
                    a.realSeatId =this.realSeatId
                }else{ 
                    a=  book.getOneRandomRoleInTeamm(exceptIds,'outsider');     
                    a.realSeatId =this.realSeatId
                } 

                book.addMessage(this.title()+"发动技能改变身份为"+a.name+book.getLuck())
                result = a;
            } else {


                book.addMessage(this.title()+"发动技能改变身份失败"+book.getLuck())
                result = this;
            }

        }        
        return result;
    }



}
