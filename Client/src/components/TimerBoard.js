import * as PIXI from 'pixi.js'
import Application from '../Application'

class Timer {
    constructor () { 
      this.count =0;
      this.enable = true;
      this.counter = null;
      
    }
    timeOut(t){      
      this.counter =
      setTimeout(()=>{
        if (t){          
          if (this.count>0){
            this.counting =false;
            this.count --;
            t.turnCountdown(this.count);      
            this.timeOut(t);
          } else {
          //  console.log('Timer Over')
            this.enable = true;
            
          }
        }
      },1000);
    }
    reset(){
      if (this.counter)
       clearTimeout(this.counter)
    }
}
  

export default class TimerBoard extends PIXI.Container {

    constructor (app) {
        super()
        this.app = app
        this.loader = app.loader
        var id = this.loader.resources["tb"].textures; 
      this.background = new PIXI.Sprite(id["header.png"])  
       this.timeRemaining = new PIXI.Text("0", {
        font: "80px",
        fill: 0xffffff,
        textAlign: 'center'
      })
      this.timeRemaining.x =Application.WIDTH / 2 -40;
      this.timeRemaining.y =50;

      this.statusText = new PIXI.Text("", {
        font: "36px JennaSue",
        fill: 0xffffff,
        textAlign: 'left'
      })
      this.statusText.x = Application.WIDTH / 2 -120;
      this.statusText.y =5;   
        

      this.background.addChild(this.statusText)
      this.background.addChild(this.timeRemaining)
      this.timer= new Timer();

        this.addChild(this.background)
    }
    init(room){
        this.room = room;
    
        this.room.state.listen("progressChanged", (progressChanged) => { 
           var progress = this.room.state.progress;
           this.draw(progress);
     
        })
     
        this.room.state.listen("serverTimeout", (serverTimeout) => { 
         
           this.drawTimer(serverTimeout)
    
        })

       
        this.room.state.progress.onChange = (value,index) => {
         // console.log(value)
        }
        
        



    } 
    drawTimer(serverTimeout){
      if (serverTimeout==0) return;
    // console.log("drawTimer",serverTimeout)
      this.timeRemaining.text = String(serverTimeout)
      this.fadeOutIn( this.timeRemaining)
    }

    


    transitionIn(sprite) {    
      
      tweener.add(sprite).to({ alpha: 1 }, 500, Tweener.ease.quintOut)
        
    }
    transitionOut (sprite) {
        return tweener.add(sprite).to({ alpha: 0 }, 500, Tweener.ease.quintOut)
    }

    fadeOutIn(sprite){
        tweener.add(sprite).to({ alpha: 0 }, 500, Tweener.ease.quintOut).then(function(){
             tweener.add(sprite).to({ alpha: 1 }, 100, Tweener.ease.quintOut)
        }) 
    }


    setTimerByValue(value){
      //console.log(data)
      // this.timer = new Timer();
      // this.statuText.text = data.name;
     
       //this.timer.reset();
       for (var i=0;i<value.lenght;i++){
         var fileld = value[i]
         console.log(field)
         switch (fileld) {          
          case 'leftTimeout':
            this.timeRemaining.text = data.value
          break;
          case 'name':
              this.statusText.text = data.value
          break;
  
         }


       }


      // this.statusText.text =data.name;
      

      
     }
  setTimer(data){
   // this.timer = new Timer();
   // this.statuText.text = data.name;
    console.log("setTimer",data)
    //this.timer.reset();
    this.statusText.text =data.name;
    this.timeRemaining.text = data.leftTimeout
    this.timer.count =data.leftTimeout;
    this.timer.timeOut(this);  
   
  }

  draw(data,reason){
    if (!data) return;
    this.statusText.text =data.name;
    this.timeRemaining.text = data.leftTimeout
    this.timer.count =data.leftTimeout;
  }
    
  turnCountdown (count) {
    // console.log('turnCountdown')
      //var currentNumber = parseInt(this.timeRemaining.text, 10) - 1
      var currentNumber = parseInt(count) ;
      
  
      if (currentNumber >= 0) {
        this.timeRemaining.text = currentNumber.toString()
      }
  
      if (currentNumber <= 3) {
        this.timeRemaining.style.fill = '#934e60';
      } else {
        this.timeRemaining.style.fill = '#000000';
      }
  
      if (currentNumber<=0){
        clearTimeout(this.countdownInterval);
      }
  
    }

    nextTurn (playerId) {
        tweener.add(this.statusText).to({
         // y: Application.HEIGHT - Application.MARGIN + 10,
          alpha: 0
        }, 200, Tweener.ease.quintOut).then(() => {
    
          if (playerId == this.room.sessionId) {
            this.statusText.text = "你的回合!"
    
          } else {
            var playerName = this.room.state.players[playerId].name;
            this.statusText.text = playerName+"的回合"
          }
    
          //this.statusText.x = Application.WIDTH / 2 - this.statusText.width / 2
    
          tweener.add(this.statusText).to({
         //   y: Application.HEIGHT - Application.MARGIN,
            alpha: 1
          }, 200, Tweener.ease.quintOut)
    
        })
        this.timeRemaining.style.fill = '#000000';
        this.timeRemaining.text =  this.room.state.timeOut; 
      }
      nextProgress (pidName) {
        tweener.add(this.statusText).to({
         // y: Application.HEIGHT - Application.MARGIN + 10,
          alpha: 0
        }, 200, Tweener.ease.quintOut).then(() => {
    
          //this.statusText.x = Application.WIDTH / 2 - this.statusText.width / 2
    
          this.statusText.text =pidName;
    
          tweener.add(this.statusText).to({
           // y: Application.HEIGHT - Application.MARGIN,
            alpha: 1
          }, 200, Tweener.ease.quintOut)
    
        })
        this.timeRemaining.style.fill = '#000000';
        this.timeRemaining.text =  this.room.state.systemTimeout; 
        //this.timeRemaining.text =  this.room.state.timeOut; 
      }  
    
  onSelect (id) {
    
    

  }

}
