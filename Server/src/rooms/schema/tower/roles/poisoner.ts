


import { Command } from "@colyseus/command";
import { TowerRoomState } from "../TowerRoomState";
import {Player } from "../TowerRoomPlayerState";

import { RoleCard } from "../TroubleRole";
import { RoleManager } from "../TowerRoomRoleManager";
import { HandCardDeck,HandCard } from "../TowerRoomHandCardState";
import { MagicBook } from "../TowerRoomMagicBook";
import { WishRole} from "../TowerRoomWishRole";
import { Seat, SeatManager } from "../../SeatState";
import { Nominate, NominateManager } from "../../NominateState";
import { Preview } from "../TowerPreviewManager";
import  {dice,arandom}from "../../../commands/Utils";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Poisoner  extends RoleCard {     
   
    skill(book:MagicBook){
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var tester ="";
        var result = false;   
        var answer;
        var real;
        let a:RoleCard;
        
        if (!_this){
            console.error("no this role")
            return;
        }

        let testPoison =''
        
        if (_this.targets.length ==0) {
            let exceptIds = [];
            exceptIds.push(_this.id);
            let evil =  book.getEvil();   
            evil.forEach((role:RoleCard) => { exceptIds.push(role.id);  })
            a =  book.getOneRandomRole(exceptIds,'',true,true);
       
            if (book.roleManager.isRoleUsed(testPoison)) {
                
                a = book.roleManager.roles.get(testPoison);
            }
            if (!a) a =   book.getOneRandomRole([],'',true,true);  
            a.poisoned = true;
            a.poisonPeriod = 2;
           
             answer ="随机下毒在"+a.seat()
            var statu ="";
            var real_answer = answer;
          
            book.addMessage(statu+_this.title()+real_answer)
        } else {
            var t = _this.targets[0];
            a = book.roleManager.getRoleBySeatId(t);  
            if (a){
                a.poisoned = true;
                a.poisonPeriod = 2;         
                 answer ="下毒在"+a.seat()
                var statu ="";
                var real_answer = answer;                
                book.addPrivateMessage(_this,answer,real_answer);
            } else console.error("poisoner critical error") 
        }   
     

    }


}


/*
export class Poisoner extends Command<ReconnectRoom, {
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
*/