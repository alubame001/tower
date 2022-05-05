
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

import { RoleCard} from "./TroubleRole";
import { RoleManager} from "./TowerRoomRoleManager";
import { WishRole} from "./TowerRoomWishRole";
import { HandCardDeck,HandCard} from "./TowerRoomHandCardState";
import {Player } from "./TowerRoomPlayerState";

import logger from "../../../helpers/logger";
import { Seat, SeatManager } from "../SeatState";
import { Ticket,Nominate,NominateManager } from "../NominateState";
import {ActionManager,Action } from "./TowerRoomActionState";
import {MessageManager,Reciver,Message } from "./MessageManager";
import {PreviewManager,Preview}  from "./TowerPreviewManager";
import { METHODS } from "http";

import { ReadOnlyException } from "@mikro-orm/core";

const game = require('./json/game.json');



export class Option extends Schema {   
    @type("number") townsfolk: number=0;
    @type("number") outsider: number=0;
    @type("number") minion: number=0;
    @type("number") demon: number=0;

    getTotal():number{
        var result = 0;
        result = this.townsfolk+this.outsider+ this.minion+ this.demon;
        return result;
    }
    getList():string{

        var   result = this.townsfolk+","+this.outsider+","+ this.minion+","+ this.demon;
        return result;
    }


    
}





export class MagicBook extends Schema {
    
    

    @type("string") adminId: string="";
    @type("string") report: string="";
    @type("string") eid: string="";
    @type(SeatManager) seatManager: SeatManager = new SeatManager();
    @type(NominateManager) nominateManager: NominateManager = new NominateManager();
    @type(RoleManager) roleManager: RoleManager = new RoleManager();
    @type(PreviewManager) previewManager: PreviewManager = new PreviewManager();
    
    @type(ActionManager) actionManager: ActionManager = new ActionManager();
    @type({ map: Nominate }) victims = new MapSchema();  
    @type(Option) option: Option = new Option();
    @type("number") lucky: number =90;
    @type("number") playerCount: number=0;
    @type("number") aliveCount: number=0;
    @type("number") maxRound: number=30;
    @type("number") round: number=0;
    @type("string") date: string ='';  
    @type("string") testing: string = ""; 
    @type("boolean") actinOver: boolean = false; 
    @type("boolean") voteOver: boolean = false; 
    @type("string") useSkillRoleId: string = ""; 
  //  @type(["string"]) roleList: string[] =   new ArraySchema<string>();
   // @type(["string"]) message: string[] =   new ArraySchema<string>();
   
    @type(MessageManager) messageManager: MessageManager = new MessageManager();

    setAdmin(adminId:string){
        this.adminId = adminId;
    }
    getLuck(){

       return " (检定值:"+this.lucky+")";
    }

  

    /**
     * 依照恶魔和爪的调整外来者和市民的人数
     */

 
    getGood():any{
        let arr = Array.from(this.roleManager.roles.values())   
        let res=arr.filter((item,index,array)=>{            
                return ((item.team =="outsider") || (item.team =="townsfolk"))       
        }) 
        let res2=res.filter((item,index,array)=>{            
            return ((item.alive)&&(item.used ==true))          
        }) 

        return res2;
    }


    getEvil():any{
        let arr = Array.from(this.roleManager.roles.values())   
        let res=arr.filter((item,index,array)=>{     
                  
                return ((item.team =="demon") || (item.team =="minion"))    
        }) 
        let res2=res.filter((item,index,array)=>{            
            return ((item.alive)&&(item.used ==true))          
        }) 
        return res2;
    }


    getDemon():any{
        let arr = Array.from(this.roleManager.roles.values())   
        let res=arr.filter((item,index,array)=>{            
                return ((item.team =="demon") && (item.alive ==true))       
        }) 

        let res2=res.filter((item,index,array)=>{            
            return ((item.alive)&&(item.used ==true))          
        }) 
        return res2;
    }

    /**
     *  
     * @param exceptId string
     */
     getOneRandomRole(exceptIds:any,team:string,alive:boolean,used:boolean):RoleCard{
        return  this.roleManager.getOneRandomRole(exceptIds,team,alive,used)  
     }
     getOneRandomRoleInTeamm(exceptIds:any,team:string):RoleCard{
        return  this.roleManager.getOneRandomRoleInTeamm(exceptIds,team)  
     }
  
    getRandomSeatId(exceptIds:any):string{
        return  this.roleManager.getRandomSeatId(exceptIds) 
    }
    dice(lucky:number):boolean{
        var result = false;
        var ran = Math.floor((Math.random() *100) + 0);
        
        if (ran>lucky) 
             result = true;
            else 
             result = false
   
        return result;
    }

   dropDice(isHard:boolean):boolean{
        var result = false;
        var ran = Math.floor((Math.random() *100) + 0);
        if (isHard){
            if (ran>this.lucky) 
             result = true;
            else 
             result = false
        }else {
            if (ran<this.lucky) 
             result = true;
            else 
             result = false
        }     
        return result;
    }
    yesOrNo(isHard:boolean):boolean{
        return this.dropDice(isHard);

    }   



    checkActionOver(){     
     
        if (this.actionManager.actions.size>0){
            this.actinOver = false;
            return;
        }

        this.actinOver = true;   

    }
    nextRound(){
        this.round ++;
        this.nominateManager.nextRound(this.round)
    }

    reportDate():string{
        var d = this.getDate()
        this.addMessage(d);
        return d;
    }
    isDay():boolean{
        var result = false;
        var a = this.round %2;
      //  console.log("isday",a,":",this.round)
        if (a==0){
            result = true;
        } else {
            result = false;
        }
     return result;
    }


    getDate():string{
        var result =''
        var a = this.round % 2;
        var b
        var dt;
        if (a==0){
            dt ="日"
            b = Math.floor( this.round/2);           
        }  else {
            dt ="夜"
            b = Math.floor( this.round/2)+1  ;
        }

        result = "第"+ b+dt
        if (this.round ==0) return "等待中"
        return result;

    }

    addVictime(nominate:Nominate){

        this.victims.set(nominate.id,nominate)
    }

    countAlive():number{
        var result = 0
        this.roleManager.roles.forEach((role:RoleCard) => {
            if ((role.alive) &&(role.used==true) && (role.team!="traveler") ) result ++
        })

        return result;
    }
/*
    releaseBuff(){
        // console.log("releasePoision")
         this.roleManager.roles.forEach((role:RoleCard) => {

            role.buffs.forEach((buff:HandCard) => {
                buff.buffPeriod --
                if (buff.buffPeriod<=0) {
                    console.log(role.id+" buff gone :" +buff.id)
                    role.buffs.delete(buff.id);
                }
            })

         })
     }
  */ 
     checkGameOver():boolean{
         var result = false;
         var evil = this.getEvil();
         var good = this.getGood();
         var demon = this.getDemon();
        
         if (this.checkSaint()){
             var role = this.getRoleById("saint");
            var msg =role.name +"被处决了"
            this.addMessage(msg)
            return true                 
         }
         if (demon.length ==0) {
            var msg ="恶魔全死了"
            this.addMessage(msg)
            return true           
         }

         if ((evil.length >= good.length)&&(good.length==1)) {
            var msg ="好人没了"
            this.addMessage(msg)
            return true
         }

         return  result;
     }

     checkSaint():boolean{
        var result = false;
        var role:RoleCard = this.getRoleById("saint")
        if (!role) return false;
        //this.addMessage("检查圣人是否死亡")
        this.victims.forEach((nominate:Nominate) => {
            if (nominate.name==role.name){
                if (nominate.executed == true){
                    result = true;
                }
            }
        })
        return result        
     }
     /*
     checkMayor():boolean{
        var result = false;
        var role:RoleCard = this.getRoleById("mayor")
        if (!role) return false;
        if (!role.isMayor)
       // this.addMessage("检查"+role.name+"是否死亡")
        this.victims.forEach((nominate:Nominate) => {
            if (nominate.name==role.name){
               
                    result = true;
                
            }
        })
        return result        
     } 
     */   

    nextRole(idx:number):RoleCard{
        var result = new RoleCard();
        let arr = Array.from(this.roleManager.roles.values())   
        let res=arr.filter((item,index,array)=>{   
            return ((item.alive ==true) &&(item.used ==true) &&(item.idx>idx) ) 
        })   
        let a=Array.of(0)
        a.pop();            
        res.forEach((role:RoleCard) => {           
            var i = Number.parseInt(role.seatId)           
                a.push(i)
        })
        a.sort();
        a.sort(function(x,y){
            return x-y;
        }) 

       // console.log("getNextRole",a)
        let nextSeatIdx =0;
        if (a.length>0){
            nextSeatIdx = a[0];
        }

        this.roleManager.roles.forEach((role:RoleCard) => {
            if (role.used){
                if (role.idx == nextSeatIdx){
                    result = role;
                }
            }

        })
    
        return result;
      
    }

    previousRole(idx:number):RoleCard{
        var result = new RoleCard();
        let arr = Array.from(this.roleManager.roles.values())   
        let res=arr.filter((item,index,array)=>{   
            return ((item.alive ==true) &&(item.used ==true) &&(item.idx<idx) ) 
        })   
        let a=Array.of(0)
        a.pop();            
        res.forEach((role:RoleCard) => {           
            var i = Number.parseInt(role.seatId)           
                a.push(i)
        })
        a.sort();
        a.sort(function(x,y){
            return y-x;
        }) 

      //  console.log("previousRole",a)
        let nextSeatIdx =this.playerCount;
        if (a.length>0){
            nextSeatIdx = a[0];
        }

        this.roleManager.roles.forEach((role:RoleCard) => {
            if (role.used){
                if (role.idx == nextSeatIdx){
                    result = role;
                }
            }
        })
       // console.log("getPreviousRole",result.id,":" ,result.seatId)
        return result;      
    } 
    

    initMessage(){
       // this.addMessage(this.report);
       /*
        let arr = Array.from(this.roleManager.roles.values())   
        var res=arr.filter((item,index,array)=>{   
            return  (item.team =="demon") &&(item.used ==true)
        }) 
        var demon = res[0];
        this.addMessage(demon.title());
        


        res=arr.filter((item,index,array)=>{   
            if (item.team=="minion"){
                this.addMessage(item.title());
            }
        })
        */

    
        
    }
    getRole(seatId:string):RoleCard{
        var result : RoleCard;
        this.roleManager.roles.forEach((role:RoleCard) => {
            if (role.seatId== seatId) 
                 if (role.used)
                    result = role;
        
        })
        return result;
            
    }
    getRoleById(id:string):RoleCard{
        var result : RoleCard;
        this.roleManager.roles.forEach((role:RoleCard) => {
            if (role.id== id) 
                if (role.used)
                    result = role;
        
        })
        return result;
            
    }


    //remove
    /*
    reset(){
        this.roleManager.roles.forEach((role:RoleCard) => {
            role.lie = false;
            role.voteOnly = null;
        })
        this.voteOver = false;
        this.actinOver = false;
    }
    */
    addMessage(msg:string){
        
        logger.silly(msg)
        this.messageManager.addMessage("admin",msg);
        
      
    }
    addPrivateMessage(role:RoleCard,privateMessage:string,adminMessage:string){
       // var seat:Seat = this.seatManager.getSeatBySessionId(role.sessionId);
        
        if(adminMessage)
            this.messageManager.addMessage("admin",adminMessage);
        if (privateMessage){
            role.messages.push(privateMessage)
           // if (seat)
           // this.messageManager.addMessage(seat.id,privateMessage);

        }
         

        logger.silly(adminMessage);
        
    }

    isExecuted(role:RoleCard){
        var result = false;
        var victim = this.victims.get(role.id);
        if (victim){
            if (victim.method=="executed") return true;
        }
        return result;
    }

    isMurdered(role:RoleCard){
        var result = false;
        var victim = this.victims.get(role.id);
        if (victim){
            if (victim.method=="murdered") return true;
        }
        return result;
    }


    
    

    getAlive():number{
        var result =0;
        let arr = Array.from(this.seatManager.seats.values())      
        let res=arr.filter((item,index,array)=>{
            return (item.alive == true)
        })
        result = res.length;
        return result;
  
    }
    executePlayer(target:RoleCard,starter:RoleCard){

        if (!target) return
        if (!starter) return;
        let nominate = new Nominate().assign({
            id: target.id,
            name :target.name,
            targetSeatId :target.seatId,    
            starterSeatId :starter.seatId,
            round :this.round,
            closed :true,
            method:"executed",
            executed :true                        
          });
        this.execute(nominate);


    }

    execute(nominate:Nominate){
        if (!nominate) return;
        var seatId = nominate.targetSeatId;
        console.log("execute :"+ seatId)
        nominate.executed = true;
        nominate.closed = true;
        
        this.seatManager.execute(seatId)
        this.roleManager.execute(seatId)
        this.nominateManager.execute(seatId)
        this.addVictime(nominate);

    }

    reportAllWish(){
        //var idx = 1;
        var result ="";
        for (var i = 1;i<=this.playerCount;i++){

            var _role :WishRole;    
            this.roleManager.wishRoles.forEach((wishRole:WishRole) => {
                if (wishRole.idx==i){
                    _role = wishRole;
                }
            })
            if (i == 1)
               result = "希望身份:"+_role.title();
            else
              result = result +" "+_role.title()
        }    
        
        console.log("result",result)
        this.addMessage(result);

    }
    /*

    */
     /**
      * 得知所有位置
      */
    reportAllPlace(){
        //var idx = 1;
        var result ="";
        for (var i = 1;i<=this.playerCount;i++){

            var _role :RoleCard;    
            this.roleManager.roles.forEach((role:RoleCard) => {
                if (role.used){
                    if (role.idx==i){
                        _role = role;
                    }
                 }
            })
            if (_role){
                if (_role.used){
                    if (i == 1)
                    result ="派发身份:"+ _role.title();
                 else
                   result = result +" "+_role.title()
                }

            }

        }

       // logger.silly(result)
        this.report = result
        this.addMessage(result);

    }

    setLuck(){
        var evil = this.getEvil().length;
        var good = this.getGood().length;
        this.lucky = Math.ceil( good/(evil*3)  *100) +1 ;
       // this.addMessage("检定值:"+this.lucky)
    }
    makeNewBoss(){
        var oldBoss:RoleCard;


        var alives = this.countAlive()
        var role:RoleCard =this.roleManager.roles.get("scarletwoman")
        if (!role) return;
        if (role.used){
            if (!role.alive) return;           
            if (alives<5) return;
            //this.addMessage("原来的大哥移除能力:" +oldBoss.name);
           // oldBoss.abilityId = null;
            oldBoss.enableSkill = false;
            this.roleManager.roles.set(oldBoss.id,oldBoss)
            this.addMessage("开始产生新大哥" +role.name +" : "+ alives);
            var demon:RoleCard =  this.roleManager.getRoleInTeam([""],"demon");
           // this.addMessage(role.title()+"变成新恶魔:"+demon.name);   
           
            role.enableSkill = true;
            role.abilityId = demon.id;
            role.team ="demon"
            role.otherNight = demon.otherNight;
            role.name =demon.name;
           // role.message.push("你成为新恶魔:"+role.name)
           
            this.roleManager.roles.set(role.id,role);

           this.addPrivateMessage(role,"你成为新恶魔:"+role.name, role.title+"成为新恶魔:"+role.name);
        } else {
            this.addMessage("没有小弟可以变身");
        }

        var i = this.getDemon().length;
        //this.addMessage("新大哥:"+ i);
    }





}

