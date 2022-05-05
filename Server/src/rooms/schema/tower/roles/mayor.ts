//import {Client} from "colyseus";
import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import { Seat,SeatManager} from "../../SeatState";
import { MagicBook,Option} from "../TowerRoomMagicBook";
import {Nominate,NominateManager} from "../../NominateState";
import { HandCard} from "../TowerRoomHandCardState";
import { RoleCard} from "../TroubleRole";

import {ActionManager,Action } from "../TowerRoomActionState";


export class Mayor  extends RoleCard {     
    skill(book:MagicBook){       
        var _this = book.roleManager.roles.get(book.useSkillRoleId);

       
        if (book.isDay()) return;
        if (_this.alive==true) return;
        if (!_this.isMayor) return;

        console.log(_this.title()+"使用亡语技能")

        if ((_this.poisoned)||(_this.drunked)){
            book.addMessage(_this.title()+"处於异常状态无法发动技能");
            return;
        }
      

        if (book.dropDice(false)){
            book.addMessage(_this.title()+"在夜晚被杀了,检定通过,发动技能"+book.getLuck());
            var role = book.getOneRandomRole([_this.id],"",true,true);
            if (!role) return;
            role.alive = false;
            _this.alive = true
            _this.isMayor = false;

            _this.claimAlive();
            role.claimDeath();
            //book.roleManager.roles.set(_this.id,_this);
            //book.roleManager.roles.set(role.id,role);
            

            book.addMessage(_this.title()+"在夜晚被杀了,发动技能复活."+role.title()+"死了" +book.getLuck());

        } else {
            book.addMessage(_this.title()+"在夜晚被杀了,检定失败,不发动技能");
        }
       
    }

    


}
