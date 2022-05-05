import * as PIXI from 'pixi.js'

import { Scrollbox } from 'pixi-scrollbox'

import Application from '../Application'
import LocalStorage from '../core/LocalStorage'
import GameScreen from './GameScreen'

const superagent = require('superagent');

export default class LobbyScreen extends PIXI.Container {

  constructor (app) {
    super()
    this.app = app;
    this.loader = app.loader;
    this.title =  new PIXI.Sprite(app.loader.resources.logo.texture);
    this.title.pivot.x = this.title.width / 2
    this.addChild(this.title)

    this.instructionText = new PIXI.Text("大厅界面", {
      font: "62px JennaSue",
      fill: 0x000,
      textAlign: 'center'
    })
    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)

    this.colyseus =  new PIXI.Sprite(app.loader.resources.colyseus.texture);
    this.colyseus.pivot.x = this.colyseus.width / 2
    this.addChild(this.colyseus)
  
    this.background =  new PIXI.Sprite(app.loader.resources.lobbyBoard.texture)
    //new PIXI.Sprite.fromImage('images/player-board2.png') 
   // var id = this.loader.resources["tb"].textures; 
   // this.slot = new PIXI.Sprite(id["scroll.png"])  
    this.addChild(this.background)     
   // this.background.x = 20


/*
    this.interactive = true
    this.once('click', this.startGame.bind(this))
    this.once('touchstart', this.startGame.bind(this))
*/
    this.on('dispose', this.onDispose.bind(this))
    



   this.spriteSheetId  = this.loader.resources["tb"].textures
   this.enterLobby();
   var roomId = LocalStorage.get("roomId")
   var sessionId = LocalStorage.get("sessionId")
   console.log(roomId,",",sessionId)
   //this.reconnect(roomId,sessionId); 

  }
  startGame () {
    this.app.room = this.room;
    console.log("startGame",this.room.id,":",this.room.sessionId)
    LocalStorage.set('roomId',this.room.id);
    LocalStorage.set('sessionId',this.room.sessionId);      // success

    this.emit('goto', GameScreen,this.app)  
}
  async enterLobby(){
    this.lobby = await colyseus.joinOrCreate("lobby");
   // this.lobby.send("action", { x: x, y: y })
    this.lobby.onMessage("rooms", (rooms) => {
      this.allRooms = rooms;
      //console.log(this.allRooms)
      this.addScrollBox()
    });
    
    this.lobby.onMessage("+", ([roomId, room]) => {
      const roomIndex = this.allRooms.findIndex((room) => room.roomId === roomId);
      if (roomIndex !== -1) {
        this.allRooms[roomIndex] = room;
    
      } else {
        this.allRooms.push(room);
      }
    });
    
    this.lobby.onMessage("-", (roomId) => {
      this.allRooms = allRooms.filter((room) => room.roomId !== roomId);
    });
   

  }
  addScrollBox(){
  
    var  scrollTopMargin = 10;
    var  scrollHeight = 100;
    var  scrollWidth = 460;
    var  boxHeight = 800;
    const scrollbox = new Scrollbox({ boxWidth: scrollWidth, boxHeight: boxHeight})
    scrollbox.x =90
    scrollbox.y =90
    // add a sprite to the scrollbox's content


    for (var i=0;i<20;i++){
         // var sprite = scrollbox.content.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
          var sprite = scrollbox.content.addChild(new PIXI.Sprite(this.spriteSheetId["boxScroll.png"]))
         // var empty = new PIXI.Sprite(this.spriteSheetId["empty.png"])
         // sprite.addChild(empty)

         // var scroll = new PIXI.Sprite(this.spriteSheetId["boxScroll.png"])  
          sprite.y =scrollHeight *i 
          //if (i>0)
            sprite.y = sprite.y+(i *scrollTopMargin)
          sprite.width =scrollWidth
          sprite.height = scrollHeight
          sprite.id  = i;
         
          
          if (i%2==0)
            sprite.tint = 0xB8B8B8
          else 
           sprite.tint = 0xffffff
       
        if (i< this.allRooms.length){
          var room = this.allRooms[i];
          this.createScrollText(sprite,room);
          sprite.interactive = true;
          sprite.on('click', this.joinPublicRoom.bind(this, room.roomId))
          sprite.on('touchend', this.joinPublicRoom.bind(this, room.roomId))
        }

        
        
    }    

   scrollbox.update();
   this.background.addChild(scrollbox)
    
  
  }
  createScrollText(sprite,room){
//    console.log(room)
    var playerAmount = room.clients +'/'+room.maxClients
    var fontSize = "30";
    var playerAmountText = new PIXI.Text(playerAmount, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'center'
    })
    playerAmountText.y = 18;
    playerAmountText.x = 110;
    sprite.addChild(playerAmountText);


    var date  =room.metadata.date;
    var dateText = new PIXI.Text(date, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'center'
    })
    dateText.y = 18;
    dateText.x = 260;
    sprite.addChild(dateText);

    var name  =room.metadata.name;
    var nameText = new PIXI.Text(name, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'center'
    })
    nameText.y = 46;
    nameText.x = 110;
    sprite.addChild(nameText);
    var roomId  =room.metadata.idx +" 房";
    var roomIdText = new PIXI.Text(roomId, {
      font: fontSize+"px",
      fill: '#fff',
      textAlign: 'center'
    })
    roomIdText.y = 46;
    roomIdText.x = 260;
    sprite.addChild(roomIdText);


  }
  getAvailableRooms(gameName){


    colyseus.getAvailableRooms(gameName).then(rooms => {
      rooms.forEach((room) => {
        console.log(room)

      });
    }).catch(e => {
      console.error(e);
    });

  }
  onJoin(){
    console.log("lobby onJoin!!!!");
    this.startGame();
  }
  async joinPublicRoom(roomId) {    
    console.log("joinPublicRoom "+roomId)
    var username ="Alice"
    var password ="123"
    var   that = this;

       try {
          await colyseus.joinById(String(roomId), {username:username,password:password,room_password: "",master:false }).then(room_instance => {
          this.room = room_instance;      
         // that.onJoin();
           console.log("this.room",this.room)
          console.log("Joined successfully!");

             this.startGame();

           });
       } catch (e){

        console.log(" joinPublicRoom error:",e.code)
        console.log(" joinPublicRoom error:",e.message)
        switch (e.code) {
           case 401:
            var data = JSON.parse(e.message);
            console.log("LocalStorage:",LocalStorage.get('roomId') +":" +LocalStorage.set('sessionId'));
            console.log(data.activeRoomId+":" +data.activeSessionId);

            this.reconnect(data.activeRoomId,data.activeSessionId); 
           
           break;
           case 402:
             
            var data = JSON.parse(e.message);
            console.log("LocalStorage:",LocalStorage.get('roomId') +":" +LocalStorage.set('sessionId'));
            console.log(data.activeRoomId+":" +data.activeSessionId);

            this.reconnect(data.activeRoomId,data.activeSessionId); 
           
           break;

        }
       }
  }

  async reconnect(roomId,sessionId) {
    console.log("reconnect:",roomId," - ",sessionId)


    var that = this;

    if (roomId && sessionId){
        console.log("going to reconnect "+roomId +":"+sessionId)
    
       await colyseus.reconnect(roomId, sessionId).then(room_instance => {
            this.room = room_instance;
            //console.log("Reconnected successfully!",this.room.state);
            //console.log("this.sessionId",this.sessionId);
           
           // LocalStorage.set('roomId',room.id);
           // LocalStorage.set('sessionId',room.sessionId);      // success
           // this.onJoin();
            this.startGame()
           
        }).catch(e => {

           
          
        });



    } else {

    
    }
  } 


/*
  joinPrivateRoom (roomId) {    
    client.joinById("624f153d94a56d19a4575881", {username:user_name,password:"123",room_password: "54188",master:false }).then(room_instance => {

        room = room_instance;

        console.log(room)
       // room.id ="624f153d94a56d19a4575881";
        onjoin();
        console.log("Joined successfully!");

        room.onStateChange.once(function(state) {
           console.log("initial room state:", state);
        });
      });
    }
*/
    transitionIn () {
        tweener.add(this.title).from({y: this.title.y - 10, alpha: 0}, 300, Tweener.ease.quadOut)
        tweener.add(this.colyseus).from({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quadOut)
        return tweener.add(this.instructionText).from({ alpha: 0 }, 300, Tweener.ease.quadOut)
    }

    transitionOut () {
        tweener.remove(this.title)
        tweener.remove(this.colyseus)
        tweener.remove(this.instructionText)

        tweener.add(this.title).to({y: this.title.y - 10, alpha: 0}, 300, Tweener.ease.quintOut)
        tweener.add(this.colyseus).to({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quintOut)
        return tweener.add(this.instructionText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
    }



    onResize () {
        this.title.x = Application.WIDTH / 2;
        this.title.y = Application.MARGIN

        this.instructionText.x = Application.WIDTH / 2
        this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8

        this.colyseus.x = Application.WIDTH / 2
        this.colyseus.y = Application.HEIGHT - this.colyseus.height - Application.MARGIN
    }

    onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
    }

}




