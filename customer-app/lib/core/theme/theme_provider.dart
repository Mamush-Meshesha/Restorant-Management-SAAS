import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Font size scale multipliers
enum FontSizeScale {
  small(0.85),
  medium(1.0),
  large(1.25);

  final double scale;
  const FontSizeScale(this.scale);
}

final themeProvider = NotifierProvider<ThemeNotifier, FontSizeScale>(() {
  return ThemeNotifier();
});

class ThemeNotifier extends Notifier<FontSizeScale> {
  static const _key = 'font_size_scale';

  @override
  FontSizeScale build() {
    _loadFromPrefs();
    return FontSizeScale.medium; // default
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final index = prefs.getInt(_key);
    if (index != null && index >= 0 && index < FontSizeScale.values.length) {
      state = FontSizeScale.values[index];
    }
  }

  Future<void> setScale(FontSizeScale scale) async {
    state = scale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_key, scale.index);
  }
}

// Font weight options
enum FontWeightScale {
  light(FontWeight.w300),
  regular(FontWeight.w400),
  bold(FontWeight.bold);

  final FontWeight weight;
  const FontWeightScale(this.weight);
}

final fontWeightProvider = NotifierProvider<FontWeightNotifier, FontWeightScale>(() {
  return FontWeightNotifier();
});

class FontWeightNotifier extends Notifier<FontWeightScale> {
  static const _key = 'font_weight_scale';

  @override
  FontWeightScale build() {
    _loadFromPrefs();
    return FontWeightScale.regular; // default
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final index = prefs.getInt(_key);
    if (index != null && index >= 0 && index < FontWeightScale.values.length) {
      state = FontWeightScale.values[index];
    }
  }

  Future<void> setWeight(FontWeightScale weight) async {
    state = weight;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_key, weight.index);
  }
}
