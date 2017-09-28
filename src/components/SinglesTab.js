'use strict'

import React, { Component } from 'react'
import {
  StyleSheet,
} from 'react-native'
import { StackNavigator } from 'react-navigation'
import SinglesScreen from './SinglesScreen'

export default class SinglesTab extends Component {

  render() {
    const SinglesNav =
      StackNavigator({
        Home: {
          screen: SinglesScreen,
          navigationOptions: {
            title: 'Scores',
          },
        },
      })

    return (
      <SinglesNav />
    )
  }
}
