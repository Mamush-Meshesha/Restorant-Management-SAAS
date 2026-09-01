import 'dart:io';

class ApiConstants {
  // If running on Android Emulator, localhost is 10.0.2.2.
  // For iOS Simulator, localhost is 127.0.0.1.
  static String get baseUrl {
    // We ran `adb reverse tcp:3000 tcp:3000`, so the physical device 
    // can now access the local server via 127.0.0.1 over the USB cable!
    return 'http://127.0.0.1:3000/api/v1';
  }
}
