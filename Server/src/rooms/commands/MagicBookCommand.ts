import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
import {Player } from "../schema/tower/TowerRoomPlayerState";

//import { Role } from "../schema/tower/TowerRoomRoleCardState";
import { RoleCard ,Icon} from "../schema/tower/TroubleRole";
import { RoleManager } from "../schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../schema/tower/TowerRoomHandCardState";
import { MagicBook } from "../schema/tower/TowerRoomMagicBook";
import { WishRole} from "../schema/tower/TowerRoomWishRole";
import { Seat, SeatManager } from "../schema/SeatState";
import { Nominate, NominateManager } from "../schema/NominateState";
import {MessageManager,Reciver,Message } from "../schema/tower/MessageManager";
import { Preview } from "../schema/tower/TowerPreviewManager";
import  {dice,arandom}from "./Utils";
import { Role } from "../schema/tower/TowerRoomRoleCardState";
const game = require('../schema/tower/json/game.json');
 
export class Test extends Command<TowerRoomState, {
    robots:number
}> {
 
  execute({robots}) {
      console.log("robots:",robots)
    for (var i=0;i<robots;i++){
        let player = new Player().assign({
          id: "robot"+String(i+1),
          name :"robot"+String(i+1),
          admin : false,
          robot : true
        });
        this.state.players.set(player.id,player);      
        this.state.players.get(player.id).connected = true;       
       
      }
  }
 
}

export class Init extends Command<TowerRoomState, {
   
}> {
 
  execute({}) {
    let book= this.state.magicBook;
    console.log("魔法书版本:"+this.state.options.eid+" 玩家人数:"+this.state.playerCount);
    
    book.eid = this.state.options.eid;
    book.playerCount = this.state.playerCount;
    book.aliveCount = this.state.playerCount;
    var option = game[book.playerCount-5];
    book.option.townsfolk = option.townsfolk;
    book.option.outsider = option.outsider;
    book.option.minion = option.minion;
    book.option.demon = option.demon;
    book.roleList =[];
    this.state.roles.clear();
    book.roleManager.roleCards.forEach((card:RoleCard) => {
        if (card.team!="traveler")

           this.state.roles.set(card.id,card);
    })
   /*
    book.roleManager.roles.forEach((role:RoleCard) => {
        for (var i=1;i<=this.state.playerCount;i++){
          var icon =  new Icon().assign({
            id : role.seatId+":"+String(i),
            seatId :role.seatId,
            iconSeatId :  String(i),
            roleId :role.id,
            team:""
          }); 
          role.icons.set(icon.id,icon)
        }
    })
     */

    book.roleManager.roleCards.forEach((card:RoleCard) => {
        if (card.team=="traveler"){

            book.roleManager.traveler.set(card.id,card);  
            book.roleManager.roleCards.delete(card.id);          
        }else {
            book.roleManager.roles.set(card.id,card);
        }               
    }) 

    
    this.state.handCardDeck.handCards.forEach((card:HandCard) => {
        book.roleManager.buffs.set(card.id,card);
    }) 



  }
 
}


export class WishSetup extends Command<TowerRoomState, {
   
}> {
 
  execute({}) {
    let book =  this.state.magicBook
    let roleManager = book.roleManager;
    let arr = Array.from(roleManager.wishRoles.values())      

    let res1=arr.filter((item,index,array)=>{
        return item.team =="demon"
    })
    let res2=arr.filter((item,index,array)=>{
        return item.team =="minion"
    })   
    let res3=arr.filter((item,index,array)=>{
        return item.team =="outsider"
    })   
    let res4=arr.filter((item,index,array)=>{
        return item.team =="townsfolk"
    })         
    


    
    var uniqueWish = roleManager.getUniqueWish();
    var r = Math.ceil(uniqueWish.length /2);
 


    for (var i =0 ;i<uniqueWish.length;i++){
        var id =uniqueWish[i];
        book.option = roleManager.fillRoleByWish(id,book.option);
    }
   // console.log(book.option.getList())
  


    var teams =['demon','minion','outsider','townsfolk']
    var ran1 = Math.floor((Math.random() * 12) + 0);        
    for (var i =ran1 ;i<100;i++){
        var teamIdx =  i%4;
        var team = teams[teamIdx];

       book.option = roleManager.fillRoleByTeam(team,book.option);
    }

    roleManager.finishWish(book)

    roleManager.finishOther(book);   
    roleManager.replaceRole(book);
    roleManager.roleMark(book);    


  }
 
}

export class ReleasePoision extends Command<TowerRoomState, {
   
}> {
 
  execute({}) {
    this.state.magicBook.roleManager.roles.forEach((role:RoleCard) => {
        if (role.poisoned) {
            role.poisonPeriod --;

            if (role.poisonPeriod <=0){
                role.poisoned = false;             
            }
        }
    })

  }
 
}



export class ReleaseBuff extends Command<TowerRoomState, {
   
}> {
 
  execute({}) {
     this.state.magicBook.roleManager.roles.forEach((role:RoleCard) => {

        role.buffs.forEach((buff:HandCard) => {
            buff.buffPeriod --
            if (buff.buffPeriod<=0) {
                console.log(role.id+" buff gone :" +buff.id)
                role.buffs.delete(buff.id);
            }
        })
    
     })

  }
 
}
export class ReportAllWish extends Command<TowerRoomState, {
   
}> {
 
  execute({}) {
       let book = this.state.magicBook;
        //var idx = 1;
        var result ="";
        for (var i = 1;i<=this.state.playerCount;i++){

            var _role :WishRole;    
           book.roleManager.wishRoles.forEach((wishRole:WishRole) => {
                if (wishRole.idx==i){
                    _role = wishRole;
                }
            })
            if (i == 1)
               result = "希望身份:"+_role.title();
            else
              result = result +" "+_role.title()
        }    
        
      //  console.log("result",result)
        book.addMessage(result);

    


  }
 
}


export class CheckAllDemonBuff extends Command<TowerRoomState, {
  
}> {
 
  execute({}) {
    let book = this.state.magicBook;
    book.roleManager.roles.forEach((roleCard:RoleCard) => {
        if((roleCard.used)&&(roleCard.alive)){
            var immune = false;
            var shield = false;
            var result = false;
            var demon = roleCard.buffs.get('imp');
            var monk  = roleCard.buffs.get('monk');
            if (demon){

                if(roleCard.id=="soldier"){
                    if ((roleCard.poisoned)||(roleCard.drunked)){
                        book.addMessage(roleCard.name+ "无法使用被动技能")
                    } else {
                        book.addMessage(roleCard.name+ "发动了被动技能")
                        immune = true;
                    }

                }
            
                if(monk){     
                    book.addMessage("僧侣保护了"+roleCard.name+" <平安夜>")
                    shield = true;
                } 


                if (shield||immune){

                }else {
                    let nominate = new Nominate().assign({
                        id: roleCard.id,
                        name :roleCard.name,
                        targetSeatId :roleCard.seatId,    
                        starterSeatId :demon.seatId,
                        round :book.round,
                        closed :true,
                        method:"buff",
                        executed :false                        
                    });
                    book.addVictime(nominate); 
                    roleCard.alive = false;
                    var real = roleCard.title()+"被恶魔谋杀了";                  
                    roleCard.deadRound = book.round;
                    roleCard.claimDeath(book);
                    //book.addMessage(real);
                    result = true;
                }
            }
            if (roleCard.buffs.has('imp')) roleCard.buffs.delete('imp')
            if (roleCard.buffs.has('monk')) roleCard.buffs.delete('monk')
        }
      
    })
  }
 
}

export class ResetMagicBookEveryRound extends Command<TowerRoomState, {
    
}> {
 
  execute({}) {

    this.state.magicBook.roleManager.roles.forEach((role:RoleCard) => {
        role.lie = false;
        role.voteOnly = null;
    })
    this.state.magicBook.voteOver = false;
    this.state.magicBook.actinOver = false;

  }
 
}
