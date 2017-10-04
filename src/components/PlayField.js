'use strict'

import React, { Component, PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  AlertIOS,
} from 'react-native'
import { Button } from 'react-native-elements'
import Dimensions from 'Dimensions'
import ReactMixin from 'react-mixin'
import TimerMixin from 'react-timer-mixin'
import Store from 'react-native-simple-store'
import {
  MinoColors, DefaultVals, DefaultMinos, DefaultNextMinos, MODE_BATTLE, MODE_SINGLE
} from '../Consts'
import { firebaseDb } from '../utils/firebase'

export default class PlayField extends Component {
  constructor(props) {
    super(props)

    this.state = this._initState()
  }

  componentDidMount = () => {
    this._beginFall()

    if (this.props.screenProps.mode === MODE_BATTLE) {
      this.hisValsRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.heIs).child('vals')
      this.hisValsRef.remove()
      this.hisValsRef.off()
      this.hisValsRef.on('value',
        snapshot => {
          if (snapshot.exists()) {
            this.setState({
              hisVals: snapshot.val()
            })
          }
        },
        error => {
        }
      )

      this.hisMinoTypeRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.heIs).child('minoType')
      this.hisMinoTypeRef.off()
      this.hisMinoTypeRef.on('value',
        snapshot => {
          if (snapshot.exists()) {
            this.setState({
              hisMinoType: snapshot.val()
            })
          }
        },
        error => {
        }
      )

      this.hisMinosRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.heIs).child('minos')
      this.hisMinosRef.remove()
      this.hisMinosRef.off()
      this.hisMinosRef.on('value',
        snapshot => {
          if (snapshot.exists()) {
            this.setState({
              hisMinos: snapshot.val()
            })
          }
        },
        error => {
        }
      )

      this.myPenalty = 0
      this.myPenaltyCharged = 0
      this.myPenaltyRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.iAm).child('penalty')
      this.myPenaltyRef.remove()
      this.myPenaltyRef.off()
      this.myPenaltyRef.on('value',
        snapshot => {
          if (snapshot.exists()) {
            this.myPenalty = snapshot.val()
          }
        },
        error => {
        }
      )

      firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.iAm).child('minoType')
        .set(this.state.minoType)
    }
  }

  componentWillUnmount = () => {
    this.clearInterval(this.timer)
    console.log('Timer stops')
  }

  _initState = () => {
    const firstMinoType = Math.floor(Math.random() * 7) + 1

    return {
      lines: 0,
      score: 0,
      level: 1,
      vals: DefaultVals,
      nextMinoType: Math.floor(Math.random() * 7) + 1,
      minoType: firstMinoType,
      minos: DefaultMinos[firstMinoType],
      startedAt: new Date(),
      hisVals: DefaultVals,
      hisMinos: DefaultMinos[0],
      hisMinoType: 0,
    }
  }

  _beginFall = () => {
    this.isLocked = false
    this._freeFall()
  }

  _freeFall = () => {
    const lvl = this.state.level
    this.clearInterval(this.timer)
    this.timer = this.setInterval(() => {
      if (!this._moveMinos(0, 1)) {
        this._onTouchDown()
      }
    }, (1000 - 150 * Math.sqrt(lvl)))
  }

  _fastFall = () => {
    this.clearInterval(this.timer)
    this.timer = this.setInterval(() => {
      if (!this._moveMinos(0, 1)) {
        this._onTouchDown()
      }
    }, 0.1)
  }

  _fastLeft = () => {
    this._fastSlide(-1)
  }

  _fastRight = () => {
    this._fastSlide(1)
  }

  _fastSlide = (dir) => {
    this.clearInterval(this.slideTimer)
    this.slideTimer = this.setInterval(() => {
      if (!this._moveMinos(dir, 0)) {
        this.clearInterval(this.slideTimer)
      }
    }, 0.1)
  }

  _clearFastSlide = () => {
    this.clearInterval(this.slideTimer)
  }

  _onMoveLeft = (event) => {
    this._moveMinos(-1, 0)
  }

  _onMoveRight = (event) => {
    this._moveMinos(1, 0)
  }

  _onMoveDown = (event) => {
    this._moveMinos(0, 1)
  }

  _onTurnLeft = (event) => {
    this._rotateMinos(-1)
  }

  _onTurnRight = (event) => {
    this._rotateMinos(1)
  }

  _onTouchDown = () => {
    if (this.isLocked) return

    this.clearInterval(this.timer)
    this.isLocked = true

    let newVals = []
    this.state.vals.forEach((cv,ci,ca) => {
      newVals.push(Object.assign([], cv))
    })
    const minos = this.state.minos
    const clr = this.state.minoType
    newVals[minos[0][0]][minos[1][0]] = clr
    newVals[minos[0][1]][minos[1][1]] = clr
    newVals[minos[0][2]][minos[1][2]] = clr
    newVals[minos[0][3]][minos[1][3]] = clr

    // Line break
    let breakRows = []
    for (let i = 5; i < 25; i++) {
      let prd = 1
      for (let j = 0; j < 10; j++) {
        prd *= newVals[j][i]
      }
      if (prd !== 0) {
        breakRows.push(i)
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = breakRows.length-1; j >= 0; j--) {
        newVals[i].splice(breakRows[j], 1)
      }
      for (let j = breakRows.length-1; j >= 0; j--) {
        newVals[i].unshift(0)
      }
    }

    // Level & Score
    const newLines = this.state.lines + breakRows.length
    const newLevel = (breakRows.length > 0 && (newLines % 5) < breakRows.length) ? this.state.level + 1 : this.state.level

    let newScore = this.state.score
    switch (breakRows.length) {
      case 4:
        newScore += 5 * 10
        break
      default:
        newScore += breakRows.length * 10
        break
    }

    // Penalty
    if (this.props.screenProps.mode === MODE_BATTLE) {
      const newPenalty = this.myPenalty - this.myPenaltyCharged
      if (newPenalty > 0) {
        for (let j = 0; j < newPenalty; j++) {
          const hole = Math.floor(Math.random() * 10)
          for (let i = 0; i < 10; i++) {
            if (i === hole) {
              newVals[i].push(0)
            } else {
              newVals[i].push(8)
            }
            newVals[i].shift()
          }
        }
        this.myPenaltyCharged += newPenalty
      }

      if (breakRows.length > 1) {
        const hisNewPenalty = (breakRows.length === 4) ? 4 : (breakRows.length - 1)

        const hisPenaltyRef = firebaseDb.ref('battles')
          .child(this.props.screenProps.battleKey)
          .child(this.props.screenProps.heIs).child('penalty')
        hisPenaltyRef.once('value')
        .then(snapshot => {
          const curHisPenalty = snapshot.exists() ? snapshot.val() : 0
          hisPenaltyRef.set(curHisPenalty + hisNewPenalty)
        })
      }
    }

    this.setState({
      vals: newVals,
    })

    // Check alive
    let deadBlocks = 0
    for (let i = 0; i < 10; i++) {
      deadBlocks += newVals[i][4]
    }

    let nextMinoType = 0
    let nextNextMinoType = 0
    if (deadBlocks === 0) {
      nextMinoType = this.state.nextMinoType
      nextNextMinoType = Math.floor(Math.random() * 7) + 1
    }

    this.setState({
      lines: newLines,
      score: newScore,
      level: newLevel,
      nextMinoType: nextNextMinoType,
      minoType: nextMinoType,
      minos: DefaultMinos[nextMinoType]
    })

    if (this.props.screenProps.mode === MODE_BATTLE) {
      const myValsRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.iAm).child('vals')
      myValsRef.set(newVals)
      const myMinoTypeRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.iAm).child('minoType')
      myMinoTypeRef.set(nextMinoType)
    }

    if (deadBlocks === 0) {
      this._beginFall()
    } else {
      if (this.state.score === 0) {
        this._alertRetry('GAME OVER')
      } else {
        Store.get('settings')
        .then(res => {
          const defName = res && res.name ? res.name : 'No name'

          AlertIOS.prompt(
            'GAME OVER',
            `Your score was ${ this.state.score}!!\nPlace your name on the ranking!!`,
            [
              {
                text: 'Send',
                onPress: name => {
                  this._saveScore(name)
                }
              },
            ],
            'plain-text',
            defName
          )
        })
      }
    }
  }

  _moveMinos = (x, y) => {
    if (this.isLocked) return

    const minos = this.state.minos

    const newMinos = [
      [minos[0][0] + x, minos[0][1] + x, minos[0][2] + x, minos[0][3] + x],
      [minos[1][0] + y, minos[1][1] + y, minos[1][2] + y, minos[1][3] + y],
    ]

    const vals = this.state.vals
    const canMove =
      (vals[newMinos[0][0]] && vals[newMinos[0][0]][newMinos[1][0]] === 0) &&
      (vals[newMinos[0][1]] && vals[newMinos[0][1]][newMinos[1][1]] === 0) &&
      (vals[newMinos[0][2]] && vals[newMinos[0][2]][newMinos[1][2]] === 0) &&
      (vals[newMinos[0][3]] && vals[newMinos[0][3]][newMinos[1][3]] === 0)
    if (canMove) this.setState({ minos: newMinos })

    if (this.props.screenProps.mode === MODE_BATTLE) {
      const myMinosRef = firebaseDb.ref('battles')
        .child(this.props.screenProps.battleKey)
        .child(this.props.screenProps.iAm).child('minos')
      myMinosRef.set(newMinos)
    }

    return canMove
  }

  _rotateMinos = (dir) => {
    if (this.isLocked) return

    const minos = this.state.minos

    const x_1_2 = minos[0][1] - minos[0][0]
    const y_1_2 = minos[1][1] - minos[1][0]
    const x_3_2 = minos[0][1] - minos[0][2]
    const y_3_2 = minos[1][1] - minos[1][2]
    const x_4_2 = minos[0][1] - minos[0][3]
    const y_4_2 = minos[1][1] - minos[1][3]
    const new_x_1 = minos[0][0] + x_1_2 + (dir * y_1_2)
    const new_y_1 = minos[1][0] + y_1_2 - (dir * x_1_2)
    const new_x_3 = minos[0][2] + x_3_2 + (dir * y_3_2)
    const new_y_3 = minos[1][2] + y_3_2 - (dir * x_3_2)
    const new_x_4 = minos[0][3] + x_4_2 + (dir * y_4_2)
    const new_y_4 = minos[1][3] + y_4_2 - (dir * x_4_2)

    const newMinos = [
      [new_x_1, minos[0][1], new_x_3, new_x_4],
      [new_y_1, minos[1][1], new_y_3, new_y_4],
    ]

    const vals = this.state.vals
    const canMove =
      (vals[newMinos[0][0]] && vals[newMinos[0][0]][newMinos[1][0]] === 0) &&
      (vals[newMinos[0][1]] && vals[newMinos[0][1]][newMinos[1][1]] === 0) &&
      (vals[newMinos[0][2]] && vals[newMinos[0][2]][newMinos[1][2]] === 0) &&
      (vals[newMinos[0][3]] && vals[newMinos[0][3]][newMinos[1][3]] === 0)
    if (canMove) this.setState({ minos: newMinos })

    return canMove
  }

  _alertRetry = (title) => {
    Alert.alert(
      title,
      '',
      [
        {text: 'Retry', onPress: () => {
          this.setState(this._initState())
          this._beginFall()
        }},
        {text: 'Finish', onPress: () => {
          this.props.navigator.pop()
        }},
      ],
      { cancelable: false }
    )
  }

  _saveScore = (name) => {
    Store.update('settings', {
      name: name
    })

    const now = new Date()
    let time = now.getFullYear() + '/'
    time += ('0' + (now.getMonth() + 1)).slice(-2) + '/'
    time += ('0' + now.getDate()).slice(-2) + ' '
    time += ('0' + now.getHours()).slice(-2) + ':'
    time += ('0' + now.getMinutes()).slice(-2) + ':'
    time += ('0' + now.getSeconds()).slice(-2)

    const playTime = parseInt((now.getTime() - this.state.startedAt.getTime()) / 1000)
    const hour = parseInt(playTime / 3600)
    const min = parseInt((playTime / 60) % 60)
    const sec = playTime % 60;

    const newRef = firebaseDb.ref('singles').push()
    newRef.set({
      'name': name,
      'score': this.state.score,
      'lines': this.state.lines,
      'level': this.state.level,
      'playedAt': time,
      'playTimeHour': hour,
      'playTimeMin': min,
      'playTimeSec': sec,
    })

    this._alertRetry('Try again?')
  }

  render() {
    const { width, height, scale } = Dimensions.get('window')
    const sideWidth = width - 40 - 220

    return (
      <View style={ styles.container }>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <PlayCells vals={ this.state.vals } cellSize={ 20 } />
            <Tetromino minos={ this.state.minos } minoType={ this.state.minoType } cellSize={ 20 }/>
          </View>
          <View style={{ width: sideWidth }}>
            <View style={{ borderWidth: 0.5, marginBottom: 10, padding: 2 }}>
              <Text>Next:</Text>
              <NextTetromino minoType={ this.state.nextMinoType }/>
            </View>
            <View style={{ borderWidth: 0.5, marginBottom: 10, padding: 2 }}>
              <Text>Score:</Text>
              <Text style={{ textAlign: 'center', fontSize: 20 }}>{ this.state.score }</Text>
            </View>
            <View style={{ borderWidth: 0.5, marginBottom: 10, padding: 2 }}>
              <Text>Level:</Text>
              <Text style={{ textAlign: 'center', fontSize: 20 }}>{ this.state.level }</Text>
            </View>
            <View>
              { this.props.screenProps.mode === MODE_BATTLE &&
                <View>
                  <PlayCells vals={ this.state.hisVals } cellSize={ sideWidth / 10 } />
                  <Tetromino minos={ this.state.hisMinos } minoType={ this.state.hisMinoType } cellSize={ sideWidth / 10 }/>
                </View>
              }
            </View>
          </View>
        </View>
        <View style={ styles.buttons }>
          <Button
            icon={{color: '#48BBEC', name: 'arrow-back', size: 40}}
            buttonStyle={{backgroundColor: 'white'}}
            onPress={ this._onMoveLeft }
            onPressIn={ this._fastLeft }
            onPressOut={ this._clearFastSlide }
          />
          <Button
            icon={{color: '#48BBEC', name: 'arrow-downward', size: 40}}
            buttonStyle={{backgroundColor: 'white'}}
            onPress={ this._onMoveDown }
            onPressIn={ this._fastFall }
            onPressOut={ this._freeFall }
          />
          <Button
            icon={{color: '#48BBEC', name: 'arrow-forward', size: 40}}
            buttonStyle={{backgroundColor: 'white'}}
            onPress={ this._onMoveRight }
            onPressIn={ this._fastRight }
            onPressOut={ this._clearFastSlide }
          />
          <Button
            icon={{color: '#48BBEC', name: 'cached', size: 40}}
            buttonStyle={{backgroundColor: 'white'}}
            onPress={ this._onTurnLeft }
          />
          <Button
            icon={{color: '#48BBEC', name: 'autorenew', size: 40}}
            buttonStyle={{backgroundColor: 'white'}}
            onPress={ this._onTurnRight }
          />
        </View>
      </View>
    )
  }
}

class PlayCells extends PureComponent {
  render() {
    console.log('AAA')
    let cols = []
    const cellSize = this.props.cellSize
    this.props.vals.forEach((cv,ci,ca) => {
      let cells = []
      for (let ri = 5; ri < cv.length; ri++) {
        const color = MinoColors[cv[ri]]
        const cellStyle = StyleSheet.flatten([
          styles.cell,
          { backgroundColor: color },
          { width: cellSize, height: cellSize }
        ])
        cells.push(<View key={ ci + '-' + ri } style={ cellStyle } />)
      }
      cols.push(
        <View key={ 'col-' + ci } style={ styles.col }>
          { cells }
        </View>
      )
    })

    return (
      <View style={ styles.cols }>
        { cols }
      </View>
    )
  }
}

class Tetromino extends PureComponent {
  render() {
    const xs = this.props.minos[0]
    const ys = this.props.minos[1]
    const cs = this.props.cellSize
    const colorStyle = { backgroundColor: MinoColors[this.props.minoType] }

    const mino1Styles = ys[0] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { height: cs, width: cs }, { left: xs[0]*cs, top: (ys[0]-5)*cs }]
    const mino2Styles = ys[1] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { height: cs, width: cs }, { left: xs[1]*cs, top: (ys[1]-5)*cs }]
    const mino3Styles = ys[2] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { height: cs, width: cs }, { left: xs[2]*cs, top: (ys[2]-5)*cs }]
    const mino4Styles = ys[3] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { height: cs, width: cs }, { left: xs[3]*cs, top: (ys[3]-5)*cs }]

    return (
      <View style={{ position: 'absolute' }}>
        <View style={ StyleSheet.flatten(mino1Styles) } />
        <View style={ StyleSheet.flatten(mino2Styles) } />
        <View style={ StyleSheet.flatten(mino3Styles) } />
        <View style={ StyleSheet.flatten(mino4Styles) } />
      </View>
    )
  }
}

class NextTetromino extends PureComponent {
  render() {
    const colorStyle = { backgroundColor: MinoColors[this.props.minoType] }
    const minos = DefaultNextMinos[this.props.minoType]
    const xs = minos[0]
    const ys = minos[1]

    const mino1Styles = [styles.mino, colorStyle, { height: 20, width: 20 }, { left: xs[0]*20, top: ys[0]*20 }]
    const mino2Styles = [styles.mino, colorStyle, { height: 20, width: 20 }, { left: xs[1]*20, top: ys[1]*20 }]
    const mino3Styles = [styles.mino, colorStyle, { height: 20, width: 20 }, { left: xs[2]*20, top: ys[2]*20 }]
    const mino4Styles = [styles.mino, colorStyle, { height: 20, width: 20 }, { left: xs[3]*20, top: ys[3]*20 }]

    return (
      <Text style={{ textAlign: 'center', marginTop: 10 }}>
        <View style={{ width: 80, height: 60 }}>
          <View style={ StyleSheet.flatten(mino1Styles) } />
          <View style={ StyleSheet.flatten(mino2Styles) } />
          <View style={ StyleSheet.flatten(mino3Styles) } />
          <View style={ StyleSheet.flatten(mino4Styles) } />
        </View>
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  cols: {
    flex: 1,
    flexDirection: 'row',
  },
  col: {
  },
  cell: {
    borderWidth: 0.5,
    borderColor: 'lightgray',
  },
  mino: {
    borderWidth: 0.5,
    borderColor: 'lightgray',
    position: 'absolute',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 100,
  },
  button: {
  },
  buttonText: {
    fontSize: 18,
    color: '#48BBEC'
  }
})

ReactMixin(PlayField.prototype, TimerMixin)
