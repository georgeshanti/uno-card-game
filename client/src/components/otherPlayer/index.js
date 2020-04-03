import React from 'react';
import styles from './styles.module.scss';

export default class OtherPlayer extends React.Component {

    render(){
        return (
            <div className={styles['otherPlayer'] + " " + ((this.props.currentPlayer==this.props.position)?styles["active"]:"")}>
                <span>{this.props.position}. {this.props.name}<br></br>{this.props.cards} Cards</span>
            </div>
        );
    }
}
