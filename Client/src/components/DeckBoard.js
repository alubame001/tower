import * as PIXI from 'pixi.js'
//import { Application } from 'pixi.js/lib/core';
import Application from '../Application'
export default class DeckBoard extends PIXI.Container {

  constructor (playerBoard) {
    super()
    
    this.reset();
    this.playerBoard = playerBoard;
    this.app = playerBoard.app;
    //228
    //352
    this.cardWith =228;
    this.cardHeight =352;
    this.cardScale =0.5;
    this.background = new PIXI.Sprite(this.app.loader.resources.deckBoard.texture);
    this.addChild(this.background)
    this.first = true;

   
  }
  
  init (room){
    this.room = room;  
   /*


     this.room.state.listen("gameOver", (gameOver) => { 
       if (gameOver == true){
       //  this.reset();         
       }     
    });

    this.room.state.listen("serverTime", (serverTime) => {  

       if (this.first==true){
        this.first = false;
        var player = this.room.state.players.get( this.room.sessionId);
      //  console.log("First!!")        
        var handCards = Array.from(player.handCards.values());
        this.render(handCards)        
       }       
      
    }); 
    


    this.room.onMessage("messages", (message) => {    
      if (this.room.sessionId == message.id){    
        if (message.action=='updateHandCards'){       
          this.render(message.data.handCards)
        }

      }
    }); 
    */



  }

  render(handCards){
  //  console.log("handCards:",handCards.length)
  //  this.handCards = handCards;
    //console.log('drawcards this.handCards.size:' ,this.handCards.size)
    this.resetData();
    if (!handCards) return;
    var size = handCards.length;
    var idx =0;

    for (var i=0;i<size;i++){
        var card = handCards[i];
        var sprite =this.newCard(card,size,i);
        var s = this.addChild(sprite);
        this.cards.push(s);
        //idx ++      
    } 

  }

  
  getPosition(count){
    var border = 20;
    var cardWidth =60;
    var height = 300;
    var width = 568;
  
    var result =[];

    var margin = 30;
  
    for (let i=0; i<count; i++) {
      var y =   border +i*(margin+cardWidth/2);
      var data ={x:border,y:y};
        result.push(data)
    }
    return result;

  }
  reset(){
  //  console.log('Deck reset');
    this.resetData();

    this.player = null;
   // this.handCards = null;
    this.draw = false;
    this.size = 190
    this.cards = []

    
  }
  resetData(){
    if (!this.cards) return;
    if (this.cards.length <=0) return;
      while (this.cards.length>0){
        var c =this.cards.pop();
        this.removeChild(c);
      }
  }

  newCard(data,size,idx){
  
    var card =new PIXI.Sprite.fromImage('images/'+data.type+'-card.png')
    
    card.scale.set( this.cardScale)

    card.anchor.set(0.5)
    let x_border = -20;
    let y_border = 100;
    let center = Application.WIDTH / 2 +x_border;
    
    let _num = (size - 1) / 2
    let _angle = (idx - _num) * 90 / _num
    if (!_angle) _angle = 0;
    let _height =0
    let _width = 0
    let _height_offset = 5;
    let _width_offset = Application.WIDTH/size/2 +10;
    if (idx<_num){
      _height = (idx -_num) *_height_offset
      _width = (idx -_num) *_width_offset
    } else if (idx>_num){
      _height = (idx -_num) *_height_offset *-1
      _width = (idx -_num) *_width_offset 
    }
    //card.x =border+  (margin+width) *idx  
    card.x =x_border+ center +_width;
    card.y = y_border; 

   // console.log("idx:",idx,":",_angle,":",_height,":",_width,":", card.x);
    card.y  =  card.y -_height;
    card.rotation = _angle/360;



    var name =data.name
    var nameText = new PIXI.Text(name, {
      font: "80px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    nameText.y = -100;
    nameText.anchor.set(0.5)
    card.addChild(nameText)

    if (data.value>0){
    
      var valueText = new PIXI.Text(data.value, {
        font: "160px JennaSue",
        fill: '#000',
        textAlign: 'center'
      })
      valueText.y = 80;
      valueText.anchor.set(0.5)
      card.addChild(valueText) 
    }


    
    card.interactive = true;
    card.buttonMode = true;
    card.on('tap', this.onSelect.bind(this, data.id))
    card.on('click', this.onSelect.bind(this, data.id))
    return card;
  }
  isMyTurn(){
    if (this.room.state.currentTurn == this.room.sessionId)
      return true;
   else 
     return false;    
 }

  onSelect (id) {
   // console.log('card onSelect:'+id)

    //console.log(this.playerBoard.selectedPlayerId)
   
    var pid = this.room.state.pid;
    if (!pid) return;
     
    switch (pid){


        case 80:
          if (!this.isMyTurn()) return;
          if (!this.playerBoard) return;
          if (this.playerBoard.selectedPlayerId=="") return;
         // console.log('ready to use card')   
          this.room.send("action",{'action':'useHandCard','cardId':id,targetId:this.playerBoard.selectedPlayerId});
          
          break;

    }

  }

}
