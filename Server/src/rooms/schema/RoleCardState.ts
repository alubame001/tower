
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { AvatarState } from "./AvatarState";
import { Vector3 } from "../../helpers/Vectors";

//平民 警长 女巫
export class RoleCard extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("boolean") used: boolean=false;
    @type("boolean") witch: boolean=false;
    @type("boolean") sergant: boolean=false;
    @type("boolean") citizen: boolean=false;
    @type("boolean") picked: boolean=false;


}

export class RoleCardDeck extends Schema {    
    @type({ map: RoleCard }) rolecards = new MapSchema();


    init(options:any) {
        var num = 0;

        for (var i=0;i<options.平民;i++){
            var str = String(num);
           // str = this.randomString(6);
            
            var roleCard = new RoleCard().assign({    
                id :str,     
                citizen:true,
                name :'平民'
         
              });            
            this.rolecards.set(roleCard.id, roleCard);
            num++
    
        }

        for (var i=0;i<options.警长;i++){
            var str = String(num);
            //str = this.randomString(6);
            var roleCard = new RoleCard().assign({    
                id :str,   
                sergant : true,   
                name :'警长'
         
              });   
            this.rolecards.set(roleCard.id, roleCard);
            num++
    
    
        }  
        for (var i=0;i<options.女巫;i++){
            var str = String(num);
            //str = this.randomString(6);
            var roleCard = new RoleCard().assign({    
                id :str,    
                witch : true, 
                name :'女巫'
         
              });   
            this.rolecards.set(roleCard.id, roleCard);
            num++   
    
        }  


    }
    randomString(e:number) {  
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
        for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }
    arandom(a:any,b:any){
    　　return (Math.random() > 0.5) ? 1 : -1;;
    }
    shuffle(){
        var count = this.rolecards.size;                  
        const arr = Array.from( this.rolecards.values());
        arr.sort(this.arandom);      
        for(var i=0;i<arr.length;i++){
            this.rolecards.set(String(i),arr[i]);
        }
    }

    deal(){
        /*
        const arr = Array.from( this.rolecards.values());
        const firstCard = arr[0];
        var id = firstCard.id;
        const roleCard :RoleCard = this.rolecards.get(id);
        this.rolecards.delete(id);
         */

        var keys = this.rolecards.keys();
        const arr = Array.from( keys);
        var roleCard :RoleCard = this.rolecards.get(arr[0]);
        this.rolecards.delete(arr[0]);
        return roleCard;

    }
    afterDeal(){

    }



 
}
