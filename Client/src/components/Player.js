import * as PIXI from 'pixi.js'



export default class Player extends PIXI.Container {

  constructor (playerBoard,data) {
    super()   

 //   this.loader = Application.loader;

    this.size = 120
    this.room;
    this.data = data;
    this.selected =false;
    this.background = new PIXI.Sprite.fromImage('images/player-board.png') 
    this.sprite = null;
   // this.playerSlot = new PIXI.Sprite.fromImage('images/player-slot.png')     
    this.playerBar = new PIXI.Sprite.fromImage('images/player-bar.png')       
    this.button = new PIXI.Sprite.fromImage('images/player-background.png') 
    
    
    var id = loader.resources["tb"].textures; 
    this.playerSlot = new PIXI.Sprite(id["default.png"])  

    this.title = new PIXI.Sprite.fromImage("images/logo.png")

   
   this.dead =new PIXI.Sprite(id["dead.png"])  
   this.imp =new PIXI.Sprite(id["imp.png"])  

    this.playerBoard = playerBoard;

    this.pid = 0;

    var maskGraphic = new PIXI.Graphics();


  }
  
  reset(){

  }

  setup(){
      
  }


/*

  init(room){
    this.room = room;

    this.room.state.listen("pid", (pid) => { 
      this.pid = pid;  
    })
    this.room.onMessage("messages", (message) => {    
      if (this.data.id == message.id){          
        if (message.action=='updatePlayer'){
      
          var player = this.room.state.players.get(this.data.id)
          this.render(message.data);  
          
        }

      }
    }); 
 }   
*/


  render(data){

      this.sprite.children[0].children[0].children[2].text = data.hands;
      this.sprite.children[0].children[0].children[3].text = data.life;
      this.sprite.children[0].children[0].children[4].text = data.charged;

  }




  create(data){
    this.id =data.id;
    this.name = data.name;
    this.data =data;

    //var positions = this.getPosition(12);
    var  playerSlot = this.playerSlot   
    var  playerBar = this.playerBar     
    var  button = this.button 
    //var  buffBar = this.buffBar;  
    var _id = data.id ;

    let text = String(data.idx);      
    var idText = new PIXI.Text(text, {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    
    idText.x = 50;
    idText.y =50;      
    playerSlot.addChild(idText)  

    let name =data.name
    var nameText = new PIXI.Text(name, {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    nameText.x =  30; 
    nameText.y = 0;
    playerSlot.addChild(nameText) 

    var handCardText = new PIXI.Text('0', {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    handCardText.x = 120; 
    handCardText.y = -10;
    playerSlot.addChild(handCardText) 

    var hpText = new PIXI.Text('0', {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    hpText.x = 120; 
    hpText.y = 30;
    playerSlot.addChild(hpText)   


    var chargedText = new PIXI.Text('0', {
      font: "50px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    chargedText.x = 120; 
    chargedText.y = 70;
    playerSlot.addChild(chargedText)   


    //buffBar.x =200;
    
    if (data.x> Application.WIDTH / 2 -100){
      button.x  = data.x -120;
      playerSlot.x +=120;
      handCardText.x -=150;
      hpText.x -=150;
      chargedText.x -=150;
      //buffBar.x -=200;
    }

    playerBar.addChild(playerSlot)

    this.dead.x =10;
    this.dead.y = 50;
    playerSlot.addChild(this.dead)

    playerBar.addChild(this.imp)

    button.addChild(playerBar)




  

    this.sprite =button;





    return button;

    
  }

  


  setAmount(sprite,player){
    if (!sprite) return;
    if (!sprite.children) return;
    if (!sprite.children[0]) return;
   // console.log('life',life)
    sprite.children[0].children[0].children[2].text = player.hands;
    sprite.children[0].children[0].children[3].text = player.life;
    sprite.children[0].children[0].children[4].text = player.charged;
  }
  logic(id){
    switch (this.pid) {   
      case 15:
        this.playerChangeSeat(id)
      break
      case 50:
        this.select(id)

      break
      default:
        
    }
  }
  
  onSelect (sprite) {
    this.select(sprite)
  }


  
  onTakeSeat(id){
  //  console.log('onTakeSeat:'+ id)
    this.room.send("action",{"action":"takeSeat","seatId":id});
    this.playerBoard.selectedPlayerId = id;
  }

  select(sprite){
    this.playerBoard.selectedPlayerId = sprite.id;
    this.playerBoard.select(sprite);
  }
  
}
