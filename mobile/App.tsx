import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FlashMessage from 'react-native-flash-message';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';
import LoadingScreen from './src/components/common/LoadingScreen';

const App: React.FC = () => {
  useEffect(() => {
    // Set status bar style
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setBackgroundColor(COLORS.background, true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <NavigationContainer>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor={COLORS.background} 
              translucent={false}
            />
            <AppNavigator />
            <FlashMessage position="top" />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
