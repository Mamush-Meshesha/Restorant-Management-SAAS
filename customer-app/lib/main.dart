import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: DigitalHotelCustomerApp(),
    ),
  );
}

class DigitalHotelCustomerApp extends ConsumerWidget {
  const DigitalHotelCustomerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final fw = ref.watch(fontWeightProvider).weight;

    return MaterialApp.router(
      title: 'Digital Hotel',
      theme: AppTheme.lightTheme(fw),
      darkTheme: AppTheme.darkTheme(fw),
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        final fontSizeScale = ref.watch(themeProvider);
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(fontSizeScale.scale),
          ),
          child: child!,
        );
      },
    );
  }
}
