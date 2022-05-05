import * as PIXI from 'pixi.js'

import Application from '../Application'
import TitleScreen from './TitleScreen'
import EndGameScreen from './EndGameScreen'

//import Board from '../components/Board'

import CharacterSelectBoard from '../components/CharacterSelectBoard'
const superagent = require('superagent');

export default class GameScreen extends PIXI.Container {

  constructor () {
    super()

    let text = (colyseus.readyState === WebSocket.CLOSED)
      ? "Couldn't connect."
      : "选择人物"

    this.waitingText = new PIXI.Text(text, {
      font: "100px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    this.waitingText.pivot.x = this.waitingText.width / 2
    this.waitingText.pivot.y = this.waitingText.height / 2
    this.addChild(this.waitingText)

    this.on('dispose', this.onDispose.bind(this))
    this.connect();

    this.board = new CharacterSelectBoard()
   
    this.onResize()
  }


  transitionIn () {
    tweener.add(this.waitingText).from({ alpha: 0 }, 300, Tweener.ease.quintOut)
    return tweener.add(this.waitingText.scale).from({x: 1.5, y: 1.5}, 300, Tweener.ease.quintOut)
  }

  transitionOut () {
    if (this.timeIcon) {
      tweener.add(this.timeIcon).to({y: this.timeIcon.y - 10, alpha: 0}, 300, Tweener.ease.quintOut)
      tweener.add(this.timeRemaining).to({y: this.timeRemaining.y - 10, alpha: 0}, 300, Tweener.ease.quintOut)
      tweener.add(this.board).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
      return tweener.add(this.statusText).to({ y: this.statusText.y + 10, alpha: 0 }, 300, Tweener.ease.quintOut)

    } else {
      return tweener.add(this.waitingText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
    }
  }

  onJoin () {
    // not waiting anymore!
    console.log("OnJoin room:"+this.room.id+" ,"+this.room.sessionId)

    localStorage.setItem("roomId", this.room.id);
    localStorage.setItem("sessionId", this.room.sessionId);
    this.removeChild(this.waitingText)

    this.timeIcon = new PIXI.Sprite.fromImage('images/clock-icon.png')
    this.timeIcon.pivot.x = this.timeIcon.width / 2
    this.addChild(this.timeIcon)

    this.timeRemaining = new PIXI.Text("10", {
      font: "100px JennaSue",
      fill: 0x000000,
      textAlign: 'center'
    })
    this.timeRemaining.pivot.x = this.timeRemaining.width / 2
    this.addChild(this.timeRemaining)

    this.board.pivot.x = this.board.width / 2
    this.board.pivot.y = this.board.height / 2
    this.board.on('select', this.onSelect.bind(this))
    this.addChild(this.board)

    this.statusText = new PIXI.Text("请选择人物", {
      font: "50px JennaSue",
      fill: 0x000,
      textAlign: 'center'
    })
    this.statusText.pivot.y = this.statusText.height / 2
    this.addChild(this.statusText)

    this.countdownInterval = clock.setInterval(this.turnCountdown.bind(this), 1000)

    this.onResize()
  }
  async connect () {
    console.log("connect")
   // this.room = await colyseus.joinOrCreate('admin');
    this.room = await colyseus.joinById("624f153d94a56d19a4575881", {username:"John",password:"123",room_password: "54188",master:false })
    this.onJoin();
    
/*
    let numPlayers = 0;
    this.room.state.players.onAdd = () => {
      numPlayers++;
      console.log(numPlayers)
      if (numPlayers === 2) {
        this.onJoin();
      }
    }

    this.room.state.board.onChange = (value, index) => {
      const x = index % 3;
      const y = Math.floor(index / 3);
      this.board.set(x, y, value);
    }

    this.room.state.listen("currentTurn", (sessionId) => {
      // go to next turn after a little delay, to ensure "onJoin" gets called before this.
      setTimeout(() => this.nextTurn(sessionId), 10);
    });

    this.room.state.listen("draw", () => this.drawGame());
    this.room.state.listen("winner", (sessionId) => this.showWinner(sessionId));

    this.room.state.onChange = (changes) => {
      console.log("state.onChange =>", changes);
    }
*/
    this.room.onError.once(() => this.emit('goto', TitleScreen));
  }

  onSelect (x, y) {
     var index = x*3+y;
     console.log(index)
    this.room.send("selectCharacter", { idx:index })
  }

  nextTurn (playerId) {
    tweener.add(this.statusText).to({
      y: Application.HEIGHT - Application.MARGIN + 10,
      alpha: 0
    }, 200, Tweener.ease.quintOut).then(() => {

      if (playerId == this.room.sessionId) {
        this.statusText.text = "Your move!"

      } else {
        this.statusText.text = "Opponent's turn..."
      }

      this.statusText.x = Application.WIDTH / 2 - this.statusText.width / 2

      tweener.add(this.statusText).to({
        y: Application.HEIGHT - Application.MARGIN,
        alpha: 1
      }, 200, Tweener.ease.quintOut)

    })

    this.timeRemaining.style.fill = '#000000';
    this.timeRemaining.text = "600"
    this.countdownInterval.reset()
  }

  turnCountdown () {
    var currentNumber = parseInt(this.timeRemaining.text, 10) - 1

    if (currentNumber >= 0) {
      this.timeRemaining.text = currentNumber.toString()
    }

    if (currentNumber <= 3) {
      this.timeRemaining.style.fill = '#934e60';
    } else {
      this.timeRemaining.style.fill = '#000000';
    }

  }


  onResize () {
    this.waitingText.x = Application.WIDTH / 2
    this.waitingText.y = Application.HEIGHT / 2
    

    if (this.timeIcon) {
      var margin = Application.HEIGHT / 100 * 6

      this.timeIcon.x = Application.WIDTH / 2 - this.timeIcon.pivot.x
      this.timeIcon.y = margin

      this.timeRemaining.x = Application.WIDTH / 2 + this.timeIcon.pivot.x + 20
      this.timeRemaining.y = margin - 20

      this.board.x = Application.WIDTH / 2
      this.board.y = Application.HEIGHT / 2

      this.statusText.x = Application.WIDTH / 2 - this.statusText.width / 2
      this.statusText.y = Application.HEIGHT - margin
    }
    
  }

  onDispose () {
  }

}
