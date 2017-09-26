'use strict'

import React, { Component, PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Button } from 'react-native-elements'
import Dimensions from 'Dimensions'
import ReactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin'

const defaultMinos = [
  [[], []], // 0
  [[4,5,6,7], [4,4,4,4]], // 1
  [[4,5,5,6], [4,4,3,3]], // 2
  [[4,5,5,6], [3,3,4,4]], // 3
  [[4,5,6,6], [3,3,3,4]], // 4
  [[4,5,6,6], [4,4,4,3]], // 5
  [[4,4,5,5], [3,4,4,3]], // 6
  [[4,5,5,6], [4,4,3,4]]  // 7
]

const defaultNextMinos = [
  [[], []], // 0
  [[0,1,2,3], [1,1,1,1]], // 1
  [[0,1,1,2], [1,1,0,0]], // 2
  [[0,1,1,2], [0,0,1,1]], // 3
  [[0,1,2,2], [0,0,0,1]], // 4
  [[0,1,2,2], [1,1,1,0]], // 5
  [[1,1,2,2], [0,1,1,0]], // 6
  [[0,1,1,2], [1,1,0,1]]  // 7
]

const minoColors = {
  0: 'white',
  1: 'cyan',
  2: 'lime',
  3: 'magenta',
  4: 'blue',
  5: 'orange',
  6: 'yellow',
  7: 'purple',
}

const defaultVals =[
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

export default class PlayField extends Component {
  constructor(props) {
    super(props)

    const firstMinoType = Math.floor(Math.random() * 7) + 1

    this.state = {
      lines: 0,
      score: 0,
      level: 1,
      vals: defaultVals,
      nextMinoType: Math.floor(Math.random() * 7) + 1,
      minoType: firstMinoType,
      minos: defaultMinos[firstMinoType]
    }
  }

  componentDidMount = () => {
    this._beginFall()
  }

  componentWillUnmount = () => {
    this.clearInterval(this.timer)
    console.log('Timer stops')
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
    }, (1000 - 5 * lvl * lvl))
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

    for (let i = 0; i < 10; i++) {
      for (let j = breakRows.length-1; j >= 0; j--) {
        newVals[i].splice(breakRows[j], 1)
      }
      for (let j = breakRows.length-1; j >= 0; j--) {
        newVals[i].unshift(0)
      }
    }

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
      vals: newVals,
      nextMinoType: nextNextMinoType,
      minoType: nextMinoType,
      minos: defaultMinos[nextMinoType]
    })

    if (deadBlocks === 0) {
      this._beginFall()
    } else {
      Alert.alert(
        'GAME OVER',
        '',
        [
          {text: 'Replay', onPress: () => {
            const firstMinoType = Math.floor(Math.random() * 7) + 1
            this.setState({
              lines: 0,
              score: 0,
              level: 1,
              vals: defaultVals,
              nextMinoType: Math.floor(Math.random() * 7) + 1,
              minoType: firstMinoType,
              minos: defaultMinos[firstMinoType]
            })
            this._beginFall()
          }},
          {text: 'Finish', onPress: () => {
            this.props.navigator.pop()
          }},
        ],
        { cancelable: false }
      )
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

  render() {
    const { width, height, scale } = Dimensions.get('window')
    const sideWidth = width - 40 - 220

    return (
      <View style={ styles.container }>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <PlayCells vals={ this.state.vals } />
            <Tetromino minos={ this.state.minos } minoType={ this.state.minoType }/>
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
    let cols = []
    this.props.vals.forEach((cv,ci,ca) => {
      let cells = []
      for (let ri = 5; ri < cv.length; ri++) {
        const color = minoColors[cv[ri]]
        const cellStyle = StyleSheet.flatten([styles.cell, { backgroundColor: color }])
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
    const colorStyle = { backgroundColor: minoColors[this.props.minoType] }

    const mino1Styles = ys[0] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { left: xs[0]*20, top: (ys[0]-5)*20 }]
    const mino2Styles = ys[1] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { left: xs[1]*20, top: (ys[1]-5)*20 }]
    const mino3Styles = ys[2] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { left: xs[2]*20, top: (ys[2]-5)*20 }]
    const mino4Styles = ys[3] < 5 ?
      [{ display: 'none' }] : [styles.mino, colorStyle, { left: xs[3]*20, top: (ys[3]-5)*20 }]

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
    const colorStyle = { backgroundColor: minoColors[this.props.minoType] }
    const minos = defaultNextMinos[this.props.minoType]
    const xs = minos[0]
    const ys = minos[1]

    const mino1Styles = [styles.mino, colorStyle, { left: xs[0]*20, top: ys[0]*20 }]
    const mino2Styles = [styles.mino, colorStyle, { left: xs[1]*20, top: ys[1]*20 }]
    const mino3Styles = [styles.mino, colorStyle, { left: xs[2]*20, top: ys[2]*20 }]
    const mino4Styles = [styles.mino, colorStyle, { left: xs[3]*20, top: ys[3]*20 }]

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
    marginTop: 65,
    marginBottom: 50,
    padding: 20,
  },
  cols: {
    flex: 1,
    flexDirection: 'row',
  },
  col: {
  },
  cell: {
    width: 20,
    height: 20,
    borderWidth: 0.5,
    borderColor: 'lightgray',
  },
  mino: {
    width: 20,
    height: 20,
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
