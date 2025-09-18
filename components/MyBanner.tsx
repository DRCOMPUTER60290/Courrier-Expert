import React from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

const isExpoGo = Constants?.appOwnership === 'expo';

let GoogleMobileAds: GoogleMobileAdsModule | null = null;

if (!isExpoGo) {
  try {
    GoogleMobileAds = require('react-native-google-mobile-ads');
  } catch (error) {
    console.warn('react-native-google-mobile-ads module unavailable', error);
  }
}

export default function MyBanner() {
  if (!GoogleMobileAds) {
    return null;
  }

  const { BannerAd, BannerAdSize, TestIds } = GoogleMobileAds;

  const bannerAdUnit = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-3734567410194819/3849723391'; // ton Ad Unit ID production

  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={bannerAdUnit}
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
