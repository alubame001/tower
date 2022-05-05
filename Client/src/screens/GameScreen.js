import * as PIXI from 'pixi.js'

import Application from '../Application'
import TitleScreen from './TitleScreen'
import EndGameScreen from './EndGameScreen'
import Board from '../components/Board'
import PlayerBoard from '../components/PlayerBoard'
import DeckBoard from '../components/DeckBoard'
import PreviewBoard from '../components/PreviewBoard'
import TimerBoard from '../components/TimerBoard'
import MessageBoard from '../components/MessageBoard'
import ChangeRoleBoard from '../components/ChangeRoleBoard'
import CharacterSelectBoard from '../components/CharacterSelectBoard'
//import LocalStorage from '../core/LocalStorage'
const superagent = require('superagent');

export default class GameScreen extends PIXI.Container {

  constructor (app) {
      super()
      this.room = app.room;
     // console.log("GameScreen")
      this.app = app;
      this.loader = app.loader;
      this.boardName ="GameScreen"
      let id  = app.loader.resources["tb"].textures
      this.messageButton = new PIXI.Sprite(id["rippon.png"])
      this.background = new PIXI.Sprite(id["empty.png"])
     

      this.addChild(this.background);
      this.on('dispose', this.onDispose.bind(this))
      /*
      if (this.room== null) {
        
        this.joinPrivateRoom(true);
      } 
      */
     console.log(this.room)
      this.onJoin()
      this.onResize()
      this.isFirst= true;
  }



  removeBoard(){
    this.resetSpriteChildren(this.background)
  }
  resetSpriteChildren(sprite){

    while (sprite.children.length>0){
   
      var c =sprite.children.pop();
    
         sprite.removeChild(c);
    }
    console.log("children length :",sprite.children.length)
  } 
  setupBoard(){  

    if (this.isFirst){
      this.playerBoard = new PlayerBoard(this.app)   
      this.timerBoard = new TimerBoard(this.app)
     
      this.deckBoard = new DeckBoard( this.playerBoard)
      this.previewBoard = new PreviewBoard(this.app)
      this.messageBoard = new MessageBoard(this.app)
      this.changeRoleBoard = new ChangeRoleBoard(this.app,this)
      console.log("this.room",this.room)

     
      this.playerBoard.init(this.room);
      this.timerBoard.init(this.room);
      this.previewBoard.init(this.room);
      this.messageBoard.init(this.room);
      this.changeRoleBoard.init(this.room);
      this.isFirst = false;
    }
    



    this.playerBoard.pivot.x = this.playerBoard.width / 2
    this.playerBoard.pivot.y = this.playerBoard.height / 2    
    this.background.addChild(this.playerBoard)

    this.timerBoard.pivot.x = this.timerBoard.width / 2
    this.timerBoard.pivot.y = this.timerBoard.height / 2
    this.background.addChild(this.timerBoard)





   
    this.changeRoleBoard.pivot.x = this.changeRoleBoard.width / 2
    this.changeRoleBoard.pivot.y = this.changeRoleBoard.height / 2
    this.changeRoleBoard.x = this.changeRoleBoard.width/ 2  
    this.background.addChild(this.changeRoleBoard)


    this.messageBoard.pivot.x = this.messageBoard.width / 2
    this.messageBoard.pivot.y = this.messageBoard.height / 2
    this.messageBoard.x = this.messageBoard.width/ 2  
    this.messageBoard.y = this.messageBoard.height/2 +200
    this.background.addChild(this.messageBoard)

    this.previewBoard.pivot.x = this.previewBoard.width / 2
    this.previewBoard.pivot.y = this.previewBoard.height / 2
    this.previewBoard.x = this.playerBoard.width/ 2  
    this.previewBoard.y = this.playerBoard.height/2+200
    this.background.addChild(this.previewBoard)


  }
  drawButton(){
  
    let id  = this.loader.resources["tb"].textures
    this.messageButton = new PIXI.Sprite(id["ribbon_on.png"])    
    this.messageButton.interactive = true;
    this.messageButton.on('tap', this.onMessageButton.bind(this))
    this.messageButton.on('click', this.onMessageButton.bind(this))
    this.messageButton.x = 0;
    this.messageButton.y = Application.HEIGHT - this.messageButton.height;
    this.addChild(this.messageButton)  

    this.messageButtonOff = new PIXI.Sprite(id["ribbon_off.png"])    
    this.messageButtonOff.interactive = false;
    this.messageButtonOff.on('tap', this.onMessageButton.bind(this))
    this.messageButtonOff.on('click', this.onMessageButton.bind(this))
    this.messageButtonOff.x = 0;
    this.messageButtonOff.y = Application.HEIGHT - this.messageButtonOff.height;

    tweener.add(this.messageButtonOff).to({alpha: 0}, 10, Tweener.ease.quintOut)
    this.addChild(this.messageButtonOff)  


  }
  removeButton(){
    this.removeChild(this.messageButton)
    this.removeChild(this.messageButtonOff)
  }

  onMessageButton(){ 
    
    this.messageBoard.onClick();
    if (this.messageBoard.isShow){
      tweener.add(this.messageButtonOff).to({alpha: 1}, 500, Tweener.ease.quintOut)
     // tweener.add(this.messageButton).to({alpha: 0}, 100, Tweener.ease.quintOut)
      this.messageButtonOff.interactive = true;
    }else {
      tweener.add(this.messageButtonOff).to({alpha: 0}, 500, Tweener.ease.quintOut)
    //  tweener.add(this.messageButton).to({alpha: 1}, 100, Tweener.ease.quintOut)
      this.messageButton.interactive = true;
    }
    console.log(this.messageBoard.isShow)
  }
  
  getSeat(){
   this.seats= this.room.state.magicBook.seatManager.seats  
   let arr = Array.from(this.seats.values())
   
    let res1=arr.filter((item,index,array)=>{
        return (item.sessionId == this.sessionId)
      
    });
    if (res1.length>0){
      this.seat = res1[0]
      console.warn("this.seat.id:",this.seat.id)
      return this.seat
    }
  }

  initBoard(){
    console.log(Date.now()+" initBoard")
    
    this.removeBoard();
    this.setupBoard();  
    this.getSeat();  
    this.sessionId = this.room.state.sessionId;  
    this.drawButton();
    this.playerBoard.draw(this.room.state.magicBook.seatManager.seats,"initBoard");
    this.changeRoleBoard.draw(this.room.state.magicBook.seatManager.seats,"initBoard");
  
    this.timerBoard.draw(this.room.state.progress,"initBoard"); 
    this.messageBoard.resetSprites();

    this.pid = this.room.state.pid ;
    this.logic();     
    this.onResize();  
  
  }  
  updateIcon(seatId,roleId){
    console.log(seatId,roleId)
  }

  async onJoin() {   
    
    this.room.onStateChange.once((state) =>{  
        this.initBoard();
     });
    


  this.room.state.listen("pid", (pid) => {   
    this.pid =pid;     
    this.logic();     
  });   

    

   var that = this;
  this.room.onMessage("messages", (message) => {  
   // console.log(message.action)
    switch (message.action){
      case "resetAll":
       this.initBoard();
      break;

      default:
     
        this.onResize()

    }  

  }); 



  this.room.onError.once(() => this.emit('goto', TitleScreen)); 
 
  this.onResize()
   
  }
  
  logic(){     
    
    switch (this.pid) {   
      case 11:
       // this.emit('goto', TitleScreen)
        break;
      case 15:
    
        break;
      case 25:
        if (this.previewBoard)
            this.previewBoard.draw("from Gamescreen");
        if (this.playerBoard)
            this.playerBoard.hide();
        if (this.messageBoard)    
          this.messageBoard.hide();
        if (this.changeRoleBoard)             
          this.changeRoleBoard.hide();

      break;
  
      default:
        this.onResize()
      //  this.changeRoleBoard.draw(this.room.state.magicBook.seatManager.seats,"logic");
      //  this.changeRoleBoard.drawIcon(this.room.state.magicBook.roles,"logic");
      break;
    }
  
  }
  

  readyNightAction(){
    
  }
   //var host = window.document.location.host.replace(/:.*/, '');
    //var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));    

/*
  async reconnect() {
    console.log("reconnect")

     var roomId = localStorage.getItem("roomId");
    var sessionId = localStorage.getItem("sessionId");
    this.sessionId = sessionId;
    var that = this;

    if (roomId && sessionId){
        console.log("going to reconnect "+roomId +":"+sessionId)
    
        colyseus.reconnect(roomId, sessionId).then(room_instance => {
            this.room = room_instance;
            //console.log("Reconnected successfully!",this.room.state);
            //console.log("this.sessionId",this.sessionId);
           

            this.onJoin();
           
        }).catch(e => {

           
          
        });



    } else {

    
    }
  } 
*/



     joinPrivateRoom(isReconnect) {

        var user_name = "Alice"
        var room_name ="tower"
        var room_id= "9999";

        colyseus.joinById(room_id, {username:user_name,password:"123",room_password: "54188",master:false }).then((room) => {

          console.log("joinById Sucess:",room.sessionId)
          this.room = room;
          LocalStorage.set('roomId',room.id);
          LocalStorage.set('sessionId',room.sessionId);      // success

          this.onJoin();
        }).catch((err) => {
          console.log(err)
          //if(isReconnect)
             // this.reconnect();
        });



    }

  checkReady(seats){
    for (var i =0;i <seats.size;i++){
      var seat = seats[i];
      if (seat.id == this.room.state.id){
          if (seat.ready== false){
            console.log("not ready")
          }

      }
    }


  }
  onSelect (x, y) {
    this.room.send("action", { x: x, y: y })
  }

  nextProgress (pidName) {
    tweener.add(this.statusText).to({
     // y: Application.HEIGHT - Application.MARGIN + 10,
      alpha: 0
    }, 200, Tweener.ease.quintOut).then(() => {
      this.statusText.text =pidName;
      tweener.add(this.statusText).to({
       // y: Application.HEIGHT - Application.MARGIN,
        alpha: 1
      }, 200, Tweener.ease.quintOut)

    })

  }



  drawGame () {
    this.room.leave()
    this.emit('goto', EndGameScreen, { draw: true })
  }

  showWinner (sessionId) {
    this.room.leave()
    this.emit('goto', EndGameScreen, {
      won: (this.room.sessionId == sessionId)
    })
  }


  onResize () {
    //console.log("onResize")
    var margin = Application.HEIGHT / 100 * 6
    if (this.waitingText){
      this.waitingText.x = Application.WIDTH / 2
      this.waitingText.y = Application.HEIGHT / 2
    }
    if (this.progressText){
      this.progressText.x = Application.WIDTH / 2
      this.progressText.y = Application.HEIGHT / 2
    }

    if (this.playerBoard){
      this.playerBoard.x = Application.WIDTH/2
      this.playerBoard.y =  this.playerBoard.height/2; //+ (margin*1.5) ;
    }
   
    if(this.timerBoard){
      this.timerBoard.x = Application.WIDTH/2
      this.timerBoard.y =  this.timerBoard.height/2
    }

    if(this.deckBoard){
      this.deckBoard.x = Application.WIDTH/2
      this.deckBoard.y = this.playerBoard.y +   (this.playerBoard.height/2) + margin*2;
    }

    if(this.previewBoard){
      this.previewBoard.x = Application.WIDTH/2
      this.previewBoard.y =  Application.HEIGHT/2 +200
    }


    if(this.messageButton){
      this.messageButton.x = 0;
      this.messageButton.y = Application.HEIGHT - this.messageButton.height;
    }

  }
  isEnableTouch(){

    if (this.messageBoard.isShow) return false;
    if (this.changeRoleBoard.isShow) return false;

  }

  onDispose () {
   

    if (this.room) {
      //this.room.leave(false)
     // this.room.connection.close();

    } else {
      console.warn("Not connected.");
    }
    
  }

}
