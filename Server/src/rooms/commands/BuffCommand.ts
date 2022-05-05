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
