/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

'use strict'

import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  TabBarIOS,
} from 'react-native';
import PlayTab from './components/PlayTab';

export default class jetris extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'PlayTab'
    };
  }

  render() {
    return (
      <TabBarIOS>
        <TabBarIOS.Item
          selected={this.state.selectedTab === ''}
          systemIcon='favorites'
          onPress={() => {
            this.setState(
              {selectedTab: ''}
            );
          }}
        >
          <PlayTab />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          selected={this.state.selectedTab === 'PlayTab'}
          systemIcon='contacts'
          onPress={() => {
            this.setState(
              {selectedTab: 'PlayTab'}
            );
          }}
        >
          <PlayTab />
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});

AppRegistry.registerComponent('jetris', () => jetris);
