'use strict'

import React, { Component } from 'react'
import {
  StyleSheet,
} from 'react-native'
import { StackNavigator } from 'react-navigation'
import BattlesScreen from './BattlesScreen'

export default class BattlesTab extends Component {

  render() {
    const BattlesNav =
      StackNavigator({
        Home: {
          screen: BattlesScreen,
          navigationOptions: {
            title: 'Battles',
          },
        },
      })

    return (
      <BattlesNav />
    )
  }
}
