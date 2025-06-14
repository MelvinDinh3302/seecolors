# See Colors

[![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev/)

**See Colors** is a cross-platform mobile app designed to enhance image visibility for users with color blindness. Simply take or upload a photo, and the app transforms its colors for better visibility.

> 🔬 For the effectiveness of the daltonization algorithm used in this project, see my [Daltonize API documentation](https://github.com/MelvinDinh3302/daltonize-api#demonstration).

## 📲 Download

<a href="https://apps.apple.com/us/app/see-colors/id6747242092"><img src="badges/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" height="70"/></a><a href="https://play.google.com/store/apps/details?id=com.melvindinh.seecolors"><img src="badges/GetItOnGooglePlay_Badge_Web_color_English.png" height="70"/></a>

**Note for Android users**: *See Colors* is currently in **closed testing** on Google Play. To try it out:

1. Visit the [Testers Community Google Group](https://groups.google.com/g/testers-community)  
2. Click **"Join Group"**
3. After joining, you'll be able to install the app from the Play Store

## ✨ Features

- **Advanced Algorithm**: Powered by a Flask backend with optimized daltonization.
- **Integrated Camera**: Capture images directly in-app.
- **High Performance**: Handles large image uploads smoothly.
- **Easy Comparison**: Side-by-side before/after view.
- **Save Function**: Easily download the processed image to your device.
- **Beautiful Animation**: Lightweight, eye-catching Lottie animations enhance the experience. 
- **Simple Interface**: Clean and minimalist UI.

## 🛠️ Tech Stack

- React Native
- TypeScript
- Flask (Python) for backend API
- Expo ImageManipulator
- Expo FileSystem
- Expo ImagePicker
- Lottie React Native

## ⚠️ Minor Issue(s)

- Android 13+: Due to scoped storage changes, Expo MediaLibrary must request access to **images, videos, and audio** even though the app only handles photos. This may lead to misleading permission prompts.

## 📽️ Demo

https://github.com/user-attachments/assets/d121d51e-7e44-45c4-8c9b-3a26d8bc96f0

