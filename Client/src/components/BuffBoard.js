import * as PIXI from 'pixi.js'
import Application from '../Application'

export default class BuffBoard extends PIXI.Container {

    constructor (data) {
        super()

        this.background =  new PIXI.Sprite.fromImage('images/buff-bar.png')
        this.data = data;
        this.first = true
       

        this.sprite = this.background;
    }
    init(room){
        this.room = room;
        var player = this.room.state.players.get( this.data.id);  
        var buffCards = Array.from(player.buffCards.values());
            this.render(buffCards)

        /*
        this.room.state.listen("serverTime", (serverTime) => {   
             // console.log(serverTime)
               if (this.first==true){
                this.first = false;
                var player = this.room.state.players.get( this.data.id);  
                var buffCards = Array.from(player.buffCards.values());
                this.render(buffCards)
                
               } 
              
              
        });
        */ 

        this.room.onMessage("messages", (message) => {   
            
            if ( message.action =='buffCheckInfo'){  
              if (this.data.id == message.id)  
              
               this.render(message.data.buffCards)
            } 
  
     
        });        
        
    }   
    removeRender(){
        for (var i=0;i<100;i++){
            if (this.sprite.children[i]){
                var obj = this.sprite.children[i]            
                this.sprite.removeChild(obj);
            }
        }
      
    }

    render(buffCards){
       // console.log("buffcards",buffCards)
        this.removeRender();
        var idx =0;
        var height =40;
        var width = 40;
        var cardSprite
        var size = buffCards.size;  
  
        for (var i =0;i<buffCards.length;i++){
            var card = buffCards[i];
            var sprite
            switch (card.name){
                case '黑猫' :                     
                    sprite = new PIXI.Sprite.fromImage('images/card_黑猫.png')        
                  break;               
                case '保护' :       
                    sprite = new PIXI.Sprite.fromImage('images/card_保护.png')
                break; 
                case '情侣' :       
                    sprite = new PIXI.Sprite.fromImage('images/card_情侣.png')
                break; 

                case '拘留' :       
                    sprite = new PIXI.Sprite.fromImage('images/card_拘留.png')
                break; 

            }    
            if (sprite){ 
                sprite.scale.set(0.2);
                var column = Math.floor(i/3) ;
                var row = i;
                if (column>=1){
                    row = i - (column*3)
                }
               // console.log(column,row)
                if (this.data.leftSide){


                   sprite.y = height *row;
                   sprite.x = width *column*-1;

                } else {
                   sprite.y = height *row;
                   sprite.x = width *column;
                }
                
                this.sprite.addChild(sprite) 
            }    
           
   
        }


    }

    create(data){
     


        
        
        

    }
    
  onSelect (id) {
    
    

  }

}
