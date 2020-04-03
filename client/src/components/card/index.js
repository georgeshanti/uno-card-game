import React from 'react';
import styles from './styles.module.scss';

import OtherPlayer from 'components/otherPlayer';

var rows = {"blue": 3, "green": 2, "yellow": 1, "red": 0}

export default class Game extends React.Component {
    playCard=()=>{
        if(this.props.actionable)
            this.props.playCard(this.props.color, this.props.value, this.props.id)
    }
    render(){
        var yPos=0;
        var xPos=-13;
        if(this.props.color==null){
            yPos=-500;
            if(this.props.value=="+4")
                xPos=-416;
            else if(this.props.value=="Change color")
                xPos=-540;
        }
        else{
            yPos = -44 - (rows[this.props.color]*108.33);
            if(this.props.value=="+2")
                xPos=-167.4;
            else if(this.props.value=="reverse")
                xPos=-90.4;
            else if(this.props.value=="skip")
                xPos=-13;
            else
                xPos = -245 - (parseInt(this.props.value)*77.4);
        }
        return (
            <div className={styles["card"]}>
                <div className={(this.props.actionable?styles["actionable"]:"")} style={{
                    backgroundPositionX: xPos+"px",
                    backgroundPositionY: yPos+"px",
                }} onClick={this.playCard}
                ></div>
            </div>
        );
    }
}
