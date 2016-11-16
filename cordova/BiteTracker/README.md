# Mobile

## Cordova mobile app

### Prerequisites - Android
Cordova:
- npm install -g cordova

[Android SDK:](https://developer.android.com/studio/index.html)
- [Linux](https://dl.google.com/android/android-sdk_r24.4.1-linux.tgz)
- [Windows](https://dl.google.com/android/installer_r24.4.1-windows.exe)
- [OS X](https://dl.google.com/android/android-sdk_r24.4.1-macosx.zip)

[Setting env variables](https://cordova.apache.org/docs/en/latest/guide/platforms/android/#setting-environment-variables)

### Android device
Enable developer options and turn on usb debugging option for running app directly on device.

### Commands

1. Run `adb devices` to install check if your device is visible for adb.

2. Run `cordova run android` to run the app on the device in the debug mode

3. Run `cordova build android --release` to build the signed apk.
