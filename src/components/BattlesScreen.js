'use strict'

import React, { Component } from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  Modal,
  Alert,
  AlertIOS,
} from 'react-native'
import ReactMixin from 'react-mixin'
import TimerMixin from 'react-timer-mixin'
import { Icon } from 'react-native-elements'
import { StackNavigator } from 'react-navigation'
import Store from 'react-native-simple-store'
import WaitingChallenge from './WaitingChallenge'
import PlayField from './PlayField'
import BattlesList from './BattlesList'
import { BattleStatus } from '../Consts'
import { firebaseDb, firebaseAuth } from '../utils/firebase'

export default class BattlesScreen extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isPlayModalOpen: false,
      isWaitingModalOpen: false,
      battleKey: '',
      waitingMessage: '',
    }
  }

  componentDidMount = () => {
    firebaseAuth.signInAnonymously()
    .then(user => {
      this.uid = user.uid
      console.log('uid:' + this.uid)
    })
    .catch(err => {
      this.uid = firebaseDb.ref('users').push().key
    })
  }

  _askName = () => {
    Store.get('settings')
    .then(res => {
      const defName = res && res.name ? res.name : 'No name'
      AlertIOS.prompt(
        'Challenge',
        'Send a challenge with this name?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: name => { this._createChallenge(name) }
          },
        ],
        'plain-text',
        defName
      )
    })
  }

  _createChallenge = (name) => {
    Store.update('settings', {
      name: name
    })

    // TODO: waitingを探す -> いなければwaitingする
    // 1. get the oldest battle's key
    // 2. set name (on player2), status, startedAt

    const now = new Date()
    let time = now.getFullYear() + '/'
    time += ('0' + (now.getMonth() + 1)).slice(-2) + '/'
    time += ('0' + now.getDate()).slice(-2) + ' '
    time += ('0' + now.getHours()).slice(-2) + ':'
    time += ('0' + now.getMinutes()).slice(-2) + ':'
    time += ('0' + now.getSeconds()).slice(-2)

    const newRef = firebaseDb.ref('waitings').push()
    newRef.set({
      'status': BattleStatus[0],
      'sentAt': now.getTime(),
      'sentAtStr': time,
      'player1': {
        'uid': this.uid,
        'name': name
      }
    })

    this.setState({
      isWaitingModalOpen: true,
      battleKey: newRef.key,
      waitingMessage: 'Finding matches...',
    })

    const waitingRef = firebaseDb.ref('waitings').child(newRef.key)
    waitingRef.off()
    waitingRef.on('child_added',
      snapshot => {
        if (snapshot.key === 'player2') {
          let startedAt = new Date()
          startedAt.setSeconds(startedAt.getSeconds() + 30)

          this.setState({
            waitingMessage: 'A match found! Wait a minute...',
            startedAt: startedAt,
          })

          const player2Name = snapshot.child('name').val()

          const battleRef = firebaseDb.ref('battles').child(newRef.key)
          battleRef.set({
            'status': BattleStatus[0],
            'startedAt': startedAt.getTime(),
            'player1': {
              'uid': this.uid,
              'name': name
            },
            'player2': {
              'name': player2Name
            }
          })

          this._countDown()

          waitingRef.off()
        }
      },
      error => {
      }
    )
  }

  _countDown = () => {
    this.timer = this.setInterval(() => {
      const startedAt = this.state.startedAt
      const now = new Date()
      if (startedAt > now) {
        const left = Math.floor(((startedAt - now) / 1000) % 60)
        this.setState({
          waitingMessage: left + ' sec to begin the battle...'
        })
      } else {
        this.setState({
          isWaitingModalOpen: false,
          isPlayModalOpen: true,
        })
        this.clearInterval(this.timer)
      }
    }, 800)
  }

  _challenge = (key, name) => {
    Store.update('settings', {
      name: name
    })

    const waitingRef = firebaseDb.ref('waitings').child(key).child('player2')
    waitingRef.set({
      'uid': this.uid,
      'name': name
    })
    .then(() => {
      this.setState({
        isWaitingModalOpen: true,
        battleKey: key,
        waitingMessage: 'Your challenge sent! Wait a minute...',
      })

      const battleRef = firebaseDb.ref('battles')
      battleRef.off()
      battleRef.on('child_added',
        snapshot => {
          if (snapshot.key === key) {
            let startedAt = snapshot.child('startedAt').val()

            this.setState({
              startedAt: startedAt,
            })

            this._countDown()

            battleRef.off()
          }
        },
        error => {
        }
      )
    })
    .catch(err => {
      console.log(err)
      Alert.alert(
        'Fail to match',
        'Please challenge another match.',
        [
          { text: 'OK' },
        ],
        { cancelable: false }
      )
    })
  }

  _withdrawChallenge = () => {
    firebaseDb.ref('waitings').child(this.state.battleKey).remove()

    this.setState({
      isWaitingModalOpen: false,
      battleKey: '',
    })
  }

  _openPlayModal = () => {
    this.setState({
      isPlayModalOpen: true
    })
  }

  _closePlayModal = () => {
    Alert.alert(
      'Quit the game?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this.setState({ isPlayModalOpen: false }) },
      ],
      { cancelable: false }
    )
  }

  _openWaitingModal = () => {
    this.setState({
      isWaitingModalOpen: true
    })
  }

  _closeWaitingModal = () => {
    Alert.alert(
      'Withdraw the challenge?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this._withdrawChallenge() },
      ],
      { cancelable: false }
    )
  }

  render() {
    const PlayModal =
      StackNavigator({
        Home: {
          screen: PlayField,
          navigationOptions: {
            title: 'Single Play',
            headerLeft: <Button title='Quit' onPress={ this._closePlayModal } />
          },
        },
      })

    const WaitingModal =
      StackNavigator({
        Home: {
          screen: WaitingChallenge,
          navigationOptions: {
            title: 'Waiting Challenge',
            headerLeft: <Button title='Quit' onPress={ this._closeWaitingModal } />
          },
        },
      })

    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  marginBottom: 50 }}>
    //     <Text>Comming soon...</Text>
    //   </View>
    // )
    return (
      <View style={{ flex: 1, marginBottom: 50 }}>
        <Modal
          animationType='slide'
          transparent={ false }
          visible={ this.state.isPlayModalOpen }
        >
          <PlayModal />
        </Modal>
        <Modal
          animationType='none'
          transparent={ false }
          visible={ this.state.isWaitingModalOpen }
        >
          <WaitingModal
            screenProps={{ waitingMessage: this.state.waitingMessage }}
          />
        </Modal>
        <Icon
          raised
          reverse
          color='red'
          containerStyle={{ position: 'absolute', bottom: 30, right: 30, zIndex: 100 }}
          name='gamepad'
          onPress={ this._askName }
        />
        <BattlesList challenge={ this._challenge }/>
      </View>
    )
  }
}

ReactMixin(BattlesScreen.prototype, TimerMixin)
