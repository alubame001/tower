import { Command } from "@colyseus/command";
import { TowerRoomState } from "../schema/tower/TowerRoomState";
import {Player } from "../schema/tower/TowerRoomPlayerState";

import { RoleCard } from "../schema/tower/TroubleRole";
import { RoleManager } from "../schema/tower/TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../schema/tower/TowerRoomHandCardState";
import { MagicBook } from "../schema/tower/TowerRoomMagicBook";
import { WishRole} from "../schema/tower/TowerRoomWishRole";
import { Seat, SeatManager } from "../schema/SeatState";
import { Nominate, NominateManager } from "../schema/NominateState";
import { Preview } from "../schema/tower/TowerPreviewManager";
import  {dice,arandom}from "./Utils";

import {Washerwoman} from "../schema/tower/roles/washerwoman";
import {Chef} from "../schema/tower/roles/chef";
import {Investigator} from "../schema/tower/roles/investigator";
import {Librarian} from "../schema/tower/roles/librarian";

import {Monk} from "../schema/tower/roles/monk";
import {Fortuneteller} from "../schema/tower/roles/fortuneteller";
import {Undertaker} from "../schema/tower/roles/undertaker";
import {Ravenkeeper} from "../schema/tower/roles/ravenkeeper";
import {Empath} from "../schema/tower/roles/empath";
import {Virgin} from "../schema/tower/roles/virgin";
import {Slayer} from "../schema/tower/roles/slayer";
import {Soldier} from "../schema/tower/roles/soldier";
import {Mayor} from "../schema/tower/roles/mayor";

import {Butler} from "../schema/tower/roles/butler";
import {Drunk} from "../schema/tower/roles/drunk";
import {Recluse} from "../schema/tower/roles/recluse";
import {Saint} from "../schema/tower/roles/saint";

import {Scarletwoman} from "../schema/tower/roles/scarletwoman";
import {Baron} from "../schema/tower/roles/baron";
import {Spy} from "../schema/tower/roles/spy";
import {Poisoner} from "../schema/tower/roles/poisoner";

import {Imp} from "../schema/tower/roles/imp";
import { ReconnectRoom } from "../TowerRoom";
 
export class test extends Command<TowerRoomState, {
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

export class Reset extends Command<TowerRoomState, {
    
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
/*

export class SetNightOrder extends Command<TowerRoomState, {
    
}> {
 
 async execute({}) {
    let book =  this.state.magicBook;
    book.roleManager.order.clear();
    let arr = Array.from(book.roleManager.roles.values())      


    if (book.round == 1) {

      let res=arr.filter((item,index,array)=>{
        return ((item.firstNight>0) &&(item.alive)&&(item.used))
     })

      for (var i =0;i<1000;i++){          
        res.forEach(role => {
          if (role.firstNight == i)
          //  console.log(role.id+"("+role.name+")"+role.firstNight)
                 book.roleManager.order.set(role.id,role);
          
        });          
      }

    }else {
      let res=arr.filter((item,index,array)=>{
        return ((item.otherNight>0) &&(item.alive)&&(item.used))
     })

     for (var i =0;i<1000;i++){      
        res.forEach(role => {
          if (role.otherNight == i)
           // console.log(role.id,role.name,role.otherNight)
           book.roleManager.order.set(role.id,role);
            
        });          
      }
    }

  }
 
}
*/

export class SetNightOrder extends Command<TowerRoomState, {
    
}> {
 
 async execute({}) {
    let book =  this.state.magicBook;
    let roleManager = book.roleManager
    roleManager.orders=[];
    let arr = Array.from(book.roleManager.roles.values())      

    
    if (book.round == 1) {

      let res=arr.filter((item,index,array)=>{
        return ((item.firstNight>0) &&(item.alive)&&(item.used))
     })

      for (var i =0;i<1000;i++){          
        res.forEach(role => {
          if (role.firstNight == i)
          
             //    book.roleManager.order.set(role.id,role);
                 roleManager.orders.push(role.id)
          
        });          
      }

    }else {
      let res=arr.filter((item,index,array)=>{
        return ((item.otherNight>0) &&(item.alive)&&(item.used))
     })

     for (var i =0;i<1000;i++){      
        res.forEach(role => {
          if (role.otherNight == i)
         
         //  book.roleManager.order.set(role.id,role);
           roleManager.orders.push(role.id)
          
        });          
      }
    }

  }
 
}


export class UseSkill extends Command<TowerRoomState, {
  
}> {
   async execute({}) {
   // var roleId = 'imp';
 //  return [new UseSkillByRoleId().setPayload({roleId})]    



      
        let book=this.state.magicBook;
       
        
        book.roleManager.order.forEach((roleCard:RoleCard) => {
           
            book.useSkillRoleId = roleCard.id;   
          

            var demon = roleCard.buffs.get('imp');
            var monk  = roleCard.buffs.get('monk');
     
            if (demon){
                if (!monk){
                   
                    if (roleCard.triggerAfterDeath){
                        book.addMessage(roleCard.title()+"发动亡语技能")
                        roleCard.claimDeath();
                        
                    } else {
                        roleCard.claimDeath();
                        book.addMessage(roleCard.title()+"即将死亡，无法使用技能")
                        return;
                    }
                }

            }
            /*
            if (!roleCard.alive){
                if (roleCard.dead) {
                    book.addMessage(roleCard.title()+"已死亡，无法使用技能。")
                }
                return ;
            };
            */
        
            let ability :RoleCard;
            console.log("role.abilityId:",roleCard.abilityId)
           // if (roleCard.abilityId=="imp")
              
            switch ( roleCard.abilityId) { 

                case 'washerwoman':
                    ability = new Washerwoman();                 
                break;
                case 'librarian':
                    ability = new Librarian();                 
                break;
                case 'investigator':
                    ability = new Investigator();                 
                break;
                case 'chef':
                    ability = new Chef();                 
                break;
                case 'empath':
                    ability = new Empath();                 
                break;
                case 'fortuneteller':
                    ability = new Fortuneteller();                 
                break;
                case 'undertaker':
                    ability = new Undertaker();                 
                break;
                case 'monk':
                    ability = new Monk();                 
                break;
                case 'ravenkeeper':
                    ability = new Ravenkeeper();                 
                break;
                case 'virgin':
                    ability = new Virgin();                 
                break;
                case 'slayer':
                    ability = new Slayer();                 
                break;
                case 'soldier':
                    ability = new Soldier();                 
                break;
                case 'mayor':
                    ability = new Mayor();                 
                break;
                case 'butler':
                    ability = new Butler();                 
                break;
                case 'drunk':
                    ability = new Drunk();                 
                break;
                case 'recluse':
                    ability = new Recluse();                 
                break;
                case 'saint':
                    ability = new Saint();                 
                break;
                case 'poisoner':
                    ability = new Poisoner();                 
                break;
                case 'spy':
                    ability = new Spy();                 
                break;
                case 'scarletwoman':
                    ability = new Scarletwoman();                 
                break;
                case 'baron':
                    ability = new Baron();                 
                break;
                case 'imp':
                    ability = new Imp();  
                     

                  
                break;

            }                
          if (ability) ability.skill(book);


        })
    
    
    }
}


export class UseSkillByRoleId extends Command<TowerRoomState, {
   roleId:string
}> {
   async execute({roleId}) {

                console.log("roleId:",roleId)

            let book = this.state.magicBook;
            book.useSkillRoleId =roleId 
            return [new ImpSkill().setPayload({roleId})]   
    
       
        

    
    
    }
}

export class ImpSkill extends Command<ReconnectRoom, {
    abilityId:string
}> {
    execute({abilityId}) {
        console.log("imp skill!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
       let book = this.state.magicBook;

        var result = false;   
        var answer="";
        var player_answer="";
        var real;
        let a:RoleCard;
        var role = book.roleManager.roles.get(abilityId);
        if (!role){
            console.error("no role role")
            return;
        }

    
        
        if (role.targets.length ==0){
           
           var exceptIds = [];          
           exceptIds.push(role.id);
          
           if (book.playerCount>=7){
                var evil =  book.getEvil();  
                evil.forEach((role:RoleCard) => { exceptIds.push(role.id);  }) 
           }
               

            a =  book.getOneRandomRole(exceptIds,null,true,true); 
            if (!a) return;
            answer = role.title()+"对" +a.title()+"随机发动技能";
            player_answer = "对" +a.seat()+"随机发动技能";
        }else{
            var t = role.targets[0];
            if (!t) return
            a = book.roleManager.getRoleBySeatId(t);        
            //console.log("a",a.name) 
            if(!a) return
            answer = role.title()+"对" +a.title()+"发动技能";
            player_answer = "对" +a.seat()+"发动技能";
            
        }
      
        if ((role.poisoned)||(role.drunked)){
            if (role.drunked) role.statu ="<酒醉>"
            if (role.poisoned) role.statu ="<中毒>"      
        } else {
            role.statu =""
            var buff:HandCard = book.roleManager.buffs.get(role.abilityId) 
           
            if (buff&&a) {
               
                a.buffs.set(buff.id,buff)             
            } else  console.error("criticl error no abilityId")
        }  

         book.addPrivateMessage(role,player_answer,answer);



    }

}

/*
export class CheckBuff extends Command<TowerRoomState, {
    roleCard:RoledCard
}> {
    execute({roleCard}) {
        let book = this.state.magicBook;

       // console.log("CheckBuff:",roleCard.name)
         
        var immune = false;
        var shield = false;
        var result = false;
        var demon = roleCard.buffs.get('imp');
        var monk  = roleCard.buffs.get('monk');
        
        if (demon){
    
            if(roleCard.id=="soldier"){
                if ((roleCard.poisoned)||(roleCard.drunked)){
                    book.addMessage(roleCard.title()+ "无法使用被动技能")
                } else {
                    book.addMessage(roleCard.title()+ "发动了被动技能")
                    immune = true;
                }
    
            }
          
            if(monk){     
                book.addMessage("僧侣保护了"+roleCard.title()+"<平安夜>")
                shield = true;
                return;
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
                roleCard.dead = true;
                //var real =roleCard.title()+"被恶魔谋杀了";                  
                roleCard.deadRound = book.round;
                roleCard.claimDeath(book);
             
                
            }
    
    
    
    
    
        
        }
        if (roleCard.buffs.has('imp')) roleCard.buffs.delete('imp')
        if (roleCard.buffs.has('monk')) roleCard.buffs.delete('monk')








    }

}

*/
/*
export class AsyncSequence extends Command {
    execute() {
      return [new Wait().setPayload(1), new Wait().setPayload(2), new Wait().setPayload(3)];
    }
  }
  
  export class Wait extends Command<any, number> {
    async execute(number) {
        console.log("number ",number)
      await this.delay(number*100);
    }
  }
*/
  
  export class AsyncSequenceSkill extends Command {
    execute() {

       var result =[]         
       var item = new Skill().setPayload("spy");
       result.push(item)
       result.pop();
    

      let book=this.state.magicBook;     
      for (var i =0;i<book.roleManager.orders.length;i++){
          var roleId = book.roleManager.orders[i];
          var item = new Skill().setPayload(roleId);
          result.push(item);
      }





       return result;
    //  return [new Skill().setPayload("imp"), new Skill().setPayload("spy")];
    }
  }


  export class  AsyncDawnSkill extends Command {
    execute() {

       var result =[]         
       var item = new Skill().setPayload("spy");
       result.push(item)
       result.pop();
    

      let book=this.state.magicBook;   
       
      let arr = Array.from(book.actionManager.actions.keys())      


      for (var i =0;i<arr.length;i++){
          var roleId = arr[i];
          var item = new Skill().setPayload(roleId);
          result.push(item);
      }





       return result;
      //  return [new Skill().setPayload("imp"), new Skill().setPayload("spy")];
    }
  }

  export class Skill extends Command<any, roleId> {
    async execute(roleId) {
     //   console.log("roleId ",roleId)
        await this.delay(10);

        let book = this.state.magicBook;
        var roleCard:RoleCard = this.state.magicBook.roleManager.roles.get(roleId);
        if (!roleCard) return;

        var demon = roleCard.buffs.get('imp');
        var monk  = roleCard.buffs.get('monk');
 
        if (demon){
            if (!monk){
               
                if (roleCard.triggerAfterDeath){
                    book.addMessage(roleCard.title()+"发动亡语技能")
                    roleCard.claimDeath();
                    
                } else {
                    roleCard.claimDeath();
                    book.addMessage(roleCard.title()+"即将死亡，无法使用技能")
                    return;
                }
            }

        }

           
            book.useSkillRoleId = roleCard.id;   
            let ability :RoleCard;
            switch ( roleCard.abilityId) { 
                case 'washerwoman':
                    ability = new Washerwoman();     
                            
                break;
                case 'librarian':
                    ability = new Librarian();                 
                break;
                case 'investigator':
                    ability = new Investigator();                 
                break;
                case 'chef':
                    ability = new Chef();                 
                break;
                case 'empath':
                    ability = new Empath();                 
                break;
                case 'fortuneteller':
                    ability = new Fortuneteller();                 
                break;
                case 'undertaker':
                    ability = new Undertaker();                 
                break;
                case 'monk':
                    ability = new Monk();                 
                break;
                case 'ravenkeeper':
                    ability = new Ravenkeeper();                 
                break;
                case 'virgin':
                    ability = new Virgin();                 
                break;
                case 'slayer':
                    ability = new Slayer();                 
                break;
                case 'soldier':
                    ability = new Soldier();                 
                break;
                case 'mayor':
                    ability = new Mayor();                 
                break;
                case 'butler':
                    ability = new Butler();                 
                break;
                case 'drunk':
                    ability = new Drunk();                 
                break;
                case 'recluse':
                    ability = new Recluse();                 
                break;
                case 'saint':
                    ability = new Saint();                 
                break;
                case 'poisoner':
                    ability = new Poisoner();                 
                break;
                case 'spy':
                    ability = new Spy();                 
                break;
                case 'scarletwoman':
                    ability = new Scarletwoman();                 
                break;
                case 'baron':
                    ability = new Baron();                 
                break;
                case 'imp':
                    ability = new Imp();  
                    

                
                break;

            }
            if (ability) ability.skill(book);
        
       
     
    }
  }


