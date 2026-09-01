import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/splash/splash_screen.dart';
import '../../features/shell/main_shell.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/menu/presentation/menu_screen.dart';
import '../../features/reservations/presentation/reservations_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/home/presentation/home_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authStatus = ref.read(authProvider);
      final isLoggingIn = state.uri.toString() == '/login' || state.uri.toString() == '/signup';
      final isSplash = state.uri.toString() == '/splash';

      if (authStatus == AuthStatus.initial || authStatus == AuthStatus.loading) {
        return null;
      }

      if (authStatus == AuthStatus.unauthenticated && !isLoggingIn && !isSplash) {
        return '/login';
      }

      if (authStatus == AuthStatus.authenticated && (isLoggingIn || isSplash)) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/menu',
            builder: (context, state) => const MenuScreen(),
          ),
          GoRoute(
            path: '/reservations',
            builder: (context, state) => const ReservationsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );

  ref.listen(authProvider, (previous, next) {
    if (previous != next) {
      router.refresh();
    }
  });

  return router;
});
