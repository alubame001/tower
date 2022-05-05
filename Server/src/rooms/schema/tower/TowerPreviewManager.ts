import { Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";


import {RoleCard} from "./TroubleRole";


export class Preview extends Schema {
    @type("string") id: string;
    @type("string") sessionId: string;    
    @type("string") playerId: string;    
    @type("number") idx: number;    
    @type({ map: RoleCard }) pickRoleCard = new MapSchema();
    @type({ map: RoleCard }) previewRoleCards = new MapSchema();
}



export class PreviewManager extends Schema {   

    @type({ map: Preview }) previews = new MapSchema();

}







