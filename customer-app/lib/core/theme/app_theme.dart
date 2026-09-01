import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors (Luxurious, High-End Enterprise Theme)
  static const Color primary = Color(0xFFC5A880); // Gold/Champagne
  static const Color secondary = Color(0xFF1E2A38); // Deep Navy/Charcoal
  static const Color backgroundLight = Color(0xFFF9F9F9); // Very light grey/white
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceLight = Colors.white;
  static const Color surfaceDark = Color(0xFF1E1E1E);
  
  static const Color textPrimaryLight = Color(0xFF1A1A1A);
  static const Color textSecondaryLight = Color(0xFF6B7280);
  
  static const Color textPrimaryDark = Color(0xFFF9FAFB);
  static const Color textSecondaryDark = Color(0xFF9CA3AF);

  // Light Theme
  static ThemeData lightTheme(FontWeight fw) {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: primary,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surfaceLight,
        background: backgroundLight,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimaryLight,
        onBackground: textPrimaryLight,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(color: textPrimaryLight, fontWeight: fw),
        displayMedium: GoogleFonts.playfairDisplay(color: textPrimaryLight, fontWeight: fw),
        titleLarge: GoogleFonts.inter(color: textPrimaryLight, fontWeight: fw),
        bodyLarge: GoogleFonts.inter(color: textPrimaryLight),
        bodyMedium: GoogleFonts.inter(color: textSecondaryLight),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: backgroundLight,
        elevation: 0,
        iconTheme: const IconThemeData(color: textPrimaryLight, size: 20),
        titleTextStyle: TextStyle(color: textPrimaryLight, fontSize: 18, fontWeight: fw),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 60,
        iconTheme: MaterialStateProperty.all(const IconThemeData(size: 20)),
        labelTextStyle: MaterialStateProperty.all(GoogleFonts.inter(fontSize: 11, fontWeight: fw)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          textStyle: GoogleFonts.inter(fontWeight: fw, fontSize: 14),
        ),
      ),
    );
  }

  // Dark Theme
  static ThemeData darkTheme(FontWeight fw) {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primary,
      scaffoldBackgroundColor: backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: surfaceDark,
        background: backgroundDark,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimaryDark,
        onBackground: textPrimaryDark,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(color: textPrimaryDark, fontWeight: fw),
        displayMedium: GoogleFonts.playfairDisplay(color: textPrimaryDark, fontWeight: fw),
        titleLarge: GoogleFonts.inter(color: textPrimaryDark, fontWeight: fw),
        bodyLarge: GoogleFonts.inter(color: textPrimaryDark),
        bodyMedium: GoogleFonts.inter(color: textSecondaryDark),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: backgroundDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: textPrimaryDark, size: 20),
        titleTextStyle: TextStyle(color: textPrimaryDark, fontSize: 18, fontWeight: fw),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 60,
        iconTheme: MaterialStateProperty.all(const IconThemeData(size: 20)),
        labelTextStyle: MaterialStateProperty.all(GoogleFonts.inter(fontSize: 11, fontWeight: fw)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          textStyle: GoogleFonts.inter(fontWeight: fw, fontSize: 14),
        ),
      ),
    );
  }
}
