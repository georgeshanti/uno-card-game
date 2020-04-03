import React from 'react';
import styles from './styles.module.scss';

import OtherPlayer from 'components/otherPlayer';
import Card from 'components/card';
import Player from 'components/player';

export default class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            playerId: props['playerId'],
            gameState: null
        }
    }

    reset=()=>{
        localStorage.removeItem("playerId")
        window.location.reload()
    }

    componentDidMount(){
        var ws = new WebSocket("ws://"+window.location.hostname+":9000");
        var _this = this;
		ws.onmessage = function(message){
            var state = JSON.parse(message.data)
            console.log(state);
            _this.setState({gameState: state})
		}
		ws.onopen = function(){
			ws.send(JSON.stringify({"player": _this.state.playerId}));
		}
    }

    render(){
        if(this.state.gameState==null)
            return null;
        var players = this.state.gameState['players'];
        var _otherPlayers = [];
        var mePlayer = {cards: []};
        for( var player in players){
            if(players[player]['playerId']!==this.state.playerId){
                _otherPlayers.push(players[player]);
            }else if(players[player]['playerId']===this.state.playerId){
                mePlayer = players[player];
            }
        }
        var otherPlayers = _otherPlayers.map(x=>{
            return (<OtherPlayer name={x.name} cards={x.cards} position={x.position}
            currentPlayer={this.state.gameState.currentPlayer} key={x.playerId}/>)
        })
        console.log(this.state.gameState);
        return (
            <div className={styles['games']}>
                <span onClick={this.reset}>Reset</span>
                <div>
                    {otherPlayers}
                </div>
                <Card color={this.state.gameState.currentCard.color} value={this.state.gameState.currentCard.value} playCard={()=>{}}/>
                <br/>
                {this.state.gameState.color}
                <br/>
                <Player cards={mePlayer.cards} name={mePlayer.name} currentPlayer={this.state.gameState.currentPlayer}
                position={mePlayer.position} currentCard={this.state.gameState.currentCard} draw={this.state.gameState.drawable}
                currentColor={this.state.gameState.color}/>
            </div>
        );
    }
}
