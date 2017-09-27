/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

'use strict'

import React, { Component, PropTypes } from 'react'
import {
  AppRegistry,
  StyleSheet,
  TabBarIOS,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import SingleScores from './src/components/SingleScores'
import SettingsTab from './src/components/SettingsTab'

export default class jetris extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTab: 'single'
    }
  }

  render() {
    return (
      <TabBarIOS>
        <Icon.TabBarItem
          title='Single play'
          iconName='drag-handle'
          selectedIconName='drag-handle'
          selected={this.state.selectedTab === 'single'}
          onPress={() => {
            this.setState({
              selectedTab: 'single'
            })
          }}
        >
          <SingleScores />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title='Battle'
          iconName='format-align-center'
          selectedIconName='format-align-center'
          selected={this.state.selectedTab === 'battle'}
          onPress={() => {
            this.setState({
              selectedTab: 'battle'
            })
          }}
        >
          <SingleScores />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title='Settings'
          iconName='face'
          selectedIconName='face'
          selected={this.state.selectedTab === 'settings'}
          onPress={() => {
            this.setState({
              selectedTab: 'settings'
            })
          }}
        >
          <SettingsTab />
        </Icon.TabBarItem>
      </TabBarIOS>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})

AppRegistry.registerComponent('jetris', () => jetris)
