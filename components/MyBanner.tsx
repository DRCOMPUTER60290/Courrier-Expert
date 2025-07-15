import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Pendant le dev, utilise l’ID de test
const BANNER_AD_UNIT = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3734567410194819/3849723391'; // ton Ad Unit ID production

export default function MyBanner() {
  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={BANNER_AD_UNIT}
        size={BannerAdSize.LARGE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => console.log('🟢 Banner loaded')}
        onAdFailedToLoad={err => console.error('🔴 Banner error', err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
});
