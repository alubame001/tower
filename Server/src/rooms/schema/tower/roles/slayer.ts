//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Slayer  extends RoleCard {     
    skill(book:MagicBook){
        var _this = book.roleManager.roles.get(book.useSkillRoleId);


        var actions =book.actionManager.actions;
        if (!book.isDay()) return;
        if (!_this.alive) return;   
        
        if ((_this.poisoned)||(_this.drunked)){
            book.addMessage(_this.title()+"无法发动技能");
            return;
        }
             
        var action:Action = actions.get(_this.id)
        if (action){
            if (action.targets.length==0) return;
            if (action.done) return;
            var target = action.targets[0];
            var role = book.getRole(target);
            if (!role) return;
            book.addMessage(_this.title()+"对"+role.title()+"发动技能!")
            _this.handleStatu(book);                    
            action.done = true;
            actions.set(action.id,action);              
            if (_this.lie==false){
                if (role.team =="demon"){
                    let nominate = new Nominate().assign({
                        id: role.id,
                        name :role.name,
                        targetSeatId :role.seatId,    
                        starterSeatId :_this.seatId,
                        round :book.round,
                        closed :true,
                        method:"executed",
                        executed :true                        
                      });

                    //book.addVictime(role.seatId,role.id,_this.id,"executed",book.round)
                    
                  // role.alive = false;
                    role.claimDeath();
                    book.nominateManager.nominates.set(nominate.id,nominate);
                  
                    book.execute(nominate)
                    book.addMessage(role.title()+"被处决了!")
                
                }
            }

        }       



     
    }

    


}
