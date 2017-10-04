'use strict'

import React, { Component } from 'react'
import {
  View,
  Button,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native'
import { Icon } from 'react-native-elements'
import { StackNavigator } from 'react-navigation'
import { MODE_BATTLE, MODE_SINGLE } from '../Consts'
import PlayField from './PlayField'
import SinglesScoreList from './SinglesScoreList'

export default class SinglesScreen extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isModalOpen: false
    }
  }

  _openModal = () => {
    this.setState({
      isModalOpen: true
    })
  }

  _closeModal = () => {
    Alert.alert(
      'Quit the game?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this.setState({ isModalOpen: false }) },
      ],
      { cancelable: false }
    )
  }

  render() {
    const PlayFieldModal =
      StackNavigator({
        Home: {
          screen: PlayField,
          navigationOptions: {
            title: 'Single Play',
            headerLeft: <Button title='Quit' onPress={ this._closeModal } />
          },
        },
      })

    return (
      <View style={{ flex: 1, marginBottom: 50 }}>
        <Modal
          animationType='slide'
          transparent={ false }
          visible={ this.state.isModalOpen }
        >
          <PlayFieldModal
            screenProps={{ mode: MODE_SINGLE, battleKey: '-KvWQKqQkz_LasnGBfd0', iAm: 'player1', heIs: 'player1' }}
          />
        </Modal>
        <Icon
          raised
          reverse
          color='red'
          containerStyle={{ position: 'absolute', bottom: 30, right: 30, zIndex: 100 }}
          name='gamepad'
          onPress={ this._openModal }
        />
        <SinglesScoreList />
      </View>
    )
  }
}
