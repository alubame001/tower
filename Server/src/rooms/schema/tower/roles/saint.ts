import { MagicBook} from "../TowerRoomMagicBook";
import { RoleCard} from "../TroubleRole";

export class Saint  extends RoleCard {     
    skill(book:MagicBook){       
        var _this = book.roleManager.roles.get(book.useSkillRoleId);
        var real_answer ="被处决了,发动亡者技能!!"
        _this.handleStatu(book)
       
       if (book.isExecuted(_this)){            
            book.addPrivateMessage(_this,real_answer,real_answer);
       }    
    }

    


}
