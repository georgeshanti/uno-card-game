import React from 'react';
import logo from './logo.svg';
import './App.css';
import Game from 'components/game';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      gameOn: null,
      player: null
    }
    this.inputRef=React.createRef()
  }

  componentDidMount(){
    fetch("/api/game").then(res=>res.json())
    .then((res)=>{
      this.setState({gameOn: res})
    })

    this.setState({player: localStorage.getItem('playerId')})
  }

  enterGame = (e)=>{
    e.preventDefault();
    console.log(this.inputRef.current.value);
    localStorage.setItem('playerId', this.inputRef.current.value);
    this.setState({player: this.inputRef.current.value});
  }

  render(){
    var playerId=localStorage.getItem('playerId')
    return (
      <div className="App">
        {(this.state.gameOn == null) && "Ask george to start the game"}
        {(this.state.gameOn != null) && (this.state.player == null) &&
        (
          <form onSubmit={this.enterGame.bind()}>
            Player ID: <input ref={this.inputRef}></input><br></br>
            <input type="submit"></input>
          </form>
        )}
        {(this.state.gameOn != null) && (this.state.player != null) &&
          (<Game playerId={playerId}/>)
        }
      </div>
    );
  }
}

export default App;
