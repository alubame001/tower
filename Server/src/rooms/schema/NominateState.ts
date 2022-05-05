import {Delayed} from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import {RoleCard} from "./tower/TroubleRole";

import logger from "../../helpers/logger";
import { SeatManager } from "./SeatState";




export class Ticket  extends Schema {   
    @type("string") id: string; 
    @type("number") value: number = 1; 
}



export class Nominate  extends Schema {   
    @type("string") id: string; 
    @type("string") name: string; 
    
    @type("string") targetSeatId: string;    
    @type("string") starterSeatId: string;  

    @type("string") method: string;   
    @type({ map: Ticket }) tickets = new MapSchema();    
    @type("number") round: number; 
    @type("number") value: number=0; 
    @type("boolean") closed: boolean=false;
    @type("boolean") executed: boolean=false;

    countValue(){
        var i = 0;
        this.tickets.forEach((ticket:Ticket) => {           
            i += ticket.value 
        }) 
        this.value = i;    
    }
}



export class NominateManager extends Schema {
    
    
    systemTimeout: Delayed;

    @type({ map: Nominate }) nominates = new MapSchema();
    @type({ map: Nominate }) votes = new MapSchema();

    @type("number") round: number; 
    @type("number") timeOut: number; 
    @type("number") pid: number; 
    @type("string") voting: string; 
    @type("boolean") voteOver: boolean; 
    @type("number") maxRunPerRound: number =3; 

    @type(["string"]) message: string[] =   new ArraySchema<string>();

    init(){
             

    }
    countNominatePerRound(round:number):number{
        var result = 0;
        let arr = Array.from(this.votes.values())   
        let res=arr.filter((item,index,array)=>{   
            return (item.round==round ) 
        })  
        result = res.length;
 

        return result ;
    }
    
    checkNominate(seatId:string,starterId:string,round:number):boolean{
        var roundId = String(round);
        var nid  = roundId+":"+seatId;
        var result = true;
        if (this.countNominatePerRound(this.round)>=this.maxRunPerRound){
            console.log("不能提名，本轮可提名次数已达"+this.maxRunPerRound+"次")    
        }
        
        console.log("!!!!!!!!!!!!!!!!checkNominate nid:"+nid )
        if (this.votes.has(nid)){
          console.log("本轮不能再提名"+seatId+"号了")    
          result = false;    
        }
        
        this.votes.forEach((nominate:Nominate) => {      
            if (nominate.round == round ){ 
                if (nominate.starterSeatId ==starterId ){
                    console.log(starterId+"号本轮不能再提名了")
                    result  =false;
                }
            }
        })
        return result;
  
    }

    startNominate(target:RoleCard,starter:RoleCard):string{
        var result;
        var roundId = String(this.round);
        var nid  = roundId+":"+target.seatId;
        
    
        var nominate :Nominate =new Nominate().assign({    
            id :nid,            
            name :target.name,
            targetSeatId:target.seatId,
            starterSeatId:starter.seatId,
            round : this.round
        });    
        this.votes.set(nominate.id,nominate);
        if (this.votes.has(nominate.id)){
            var msg =  starter.seatId+"号对" +target.seatId+"号提名处决，进入投票环节"  
            console.log(" this.voting,"+ this.voting)
            this.voting = nid;        
            result = msg;
        }

        return result;
    }    

    /**
     * 计算出要处决的对象
     * @param alives 目前还存活的人数
     * @returns 
     */

    countVote(alives:number):Nominate{
        var nominate:Nominate;
        if (this.votes.size==0) return null;
        this.votes.forEach((nominate:Nominate) => {           
            nominate.countValue();
        }) 

    
        var line = Math.ceil(alives/2) ; 
        line =1 // to fix
        logger.silly("计票中...超过"+line+"即生效") 
        let arr = Array.from(this.votes.values())   
        let res=arr.filter((item,index,array)=>{   
           
            return (item.value>=line ) 
        })  
        var i = res.length;

        let a=Array.of(0)
        a.pop();   
        
        let _n  :Nominate  
        res.forEach((nominate:Nominate) => {        
               
            var i = nominate.value           
            a.push(i)
            if (i>max){
                max = i;
                _n = nominate
            }
        })
        a.sort();
        a.sort(function(x,y){
            return x-y;
        }) 
        var max = a[0]
 

        let res2=res.filter((item,index,array)=>{ 
            return (item.value==max ) 
        })  
        if (res2.length>=2){
            return null
        } else {
            return res2[0]
        }


        



    

       return nominate;
       
    }

    execute(seatId:string){
        if (!seatId) return;
        console.log("execute :"+seatId)
       // var vote = this.votes



    }
    checkVoteOver(){


    }
    playerVote(tickedId:string,value:number):string{     
        var result ;
              
        //var tickedId = player.seatId;
        var voting =this.voting;
        console.log("voting  " +voting)
       
        if (!voting) return;   
       
        var nominate =this.votes.get(voting);   

        var ticket :Ticket =new Ticket().assign({    
          id :tickedId,
          value :value
        });  
        result = ticket.id;
        nominate.tickets.set(ticket.id,ticket)
        return result;  
    }

    playerRemoveVote(tickedId:string):string{
        var result ;
        var voting =this.voting;       
        if (!voting) return;          
        var nominate =this.votes.get(voting);           
        if ( nominate.tickets.has(tickedId)){
            var ticket =  nominate.tickets.get(tickedId)
            result = ticket.id;
            nominate.tickets.delete(ticket.id)
            
        }
        return result;

            
    }

    nextRound(round:number){
        this.round = round;
        this.maxRunPerRound =3;
    }


}

