import React from 'react';
import styles from './styles.module.scss';

import Card from 'components/card';
var colors = ["red", "green", "blue", "yellow"]

export default class Player extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            drawNumber: this.props.draw,
            changeColor: false,
            selectedCard: null,
        }
        this.inputRef= React.createRef();
    }
    componentWillReceiveProps(){
        this.setState({changeColor: false, selectedCard: null})
    }
    playCard=(color, value, id)=>{
        if(color==null){
            this.setState({changeColor: "true", selectedCard: id})
        }else{
            fetch("/api/play-card",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'id': id, color: color})
            }).then(()=>{
                this.setState({changeColor: false, selectedCard: null})
            })
        }
    }

    drawAction=(e)=>{
        e.preventDefault()
        fetch("/api/draw-card",{
            method: 'POST'
        })
    }

    skip=(e)=>{
        e.preventDefault()
        fetch("/api/skip",{
            method: 'POST'
        })
    }

    changeColor=(e)=>{
        e.preventDefault()
        fetch("/api/play-card",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'id': this.state.selectedCard, color: this.inputRef.current.value})
        })
    }

    render(){
        var cards = this.props.cards.map(x=>({...x,actionable: false}))
        if(this.props.currentPlayer==this.props.position){
            console.log(this.props.currentCard)
            cards = cards.map(x=>{
                console.log(x.color, this.props.currentColor)
                if(x.value==="+4"){
                    x.actionable = true;
                    return x
                }else if(this.props.draw==0 && x.value=="Change color"){
                    x.actionable = true;
                    return x
                }else if(this.props.draw<2 && (x.color===this.props.currentColor || x.value===this.props.currentCard.value)){
                    x.actionable = true;
                    return x;
                }else if(x.value===this.props.currentCard.value){
                    x.actionable = true;
                    return x;
                }
                return x;
            })
        }
        cards.sort((a,b)=>{
            if(b.value=="+4")
                return false
            else if(a.value=="+4")
                return true
            else if((a.color in colors) && b.value=="Change color")
                return false
            else if((b.color in colors) && a.value=="Change color")
                return true
            else if(b.color==a.color)
                return b.value<a.value
            return b.color<a.color
        })
        console.log(cards);
        cards = cards.map((y)=>(<Card color={y.color} value={y.value} actionable={y.actionable} playCard={this.playCard} id={y.id}/>))
        return (
            <div className={styles['player'] + " " + ((this.props.currentPlayer==this.props.position)?styles["active"]:"")}>
                <span className={styles['name']}>{this.props.position}. {this.props.name}</span>
                <br></br>
                {cards}
                {(this.props.currentPlayer==this.props.position) &&
                (<div className={styles["controls"]}>
                    <br></br>
                    <span className={styles["draw"]} onClick={this.drawAction}>Draw {(this.state.drawNumber==0?1:this.state.drawNumber)}</span>
                    <span className={styles["draw"]} onClick={this.skip}>Skip</span>
                </div>)}
                {(this.state.changeColor) &&
                (<div className={styles["controls"]}>
                    <form onSubmit={this.changeColor}>
                        Player ID:
                        <select ref={this.inputRef}>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="blue">Blue</option>
                        </select><br></br>
                        <input type="submit" value="Submit"></input>
                    </form>
                </div>)}
            </div>
        );
    }
}
