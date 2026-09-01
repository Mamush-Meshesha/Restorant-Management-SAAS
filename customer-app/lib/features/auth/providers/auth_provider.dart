import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/auth_repository.dart';

enum AuthStatus { initial, unauthenticated, authenticated, loading }

final authProvider = NotifierProvider<AuthNotifier, AuthStatus>(() {
  return AuthNotifier();
});

class AuthNotifier extends Notifier<AuthStatus> {
  @override
  AuthStatus build() {
    checkAuth();
    return AuthStatus.initial;
  }

  Future<void> checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null && token.isNotEmpty) {
      state = AuthStatus.authenticated;
    } else {
      state = AuthStatus.unauthenticated;
    }
  }

  Future<void> login(String email, String password) async {
    state = AuthStatus.loading;
    try {
      final repo = ref.read(authRepositoryProvider);
      final token = await repo.login(email, password);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      state = AuthStatus.authenticated;
    } catch (e) {
      state = AuthStatus.unauthenticated;
      rethrow;
    }
  }

  Future<void> signup(Map<String, dynamic> data) async {
    state = AuthStatus.loading;
    try {
      final repo = ref.read(authRepositoryProvider);
      final token = await repo.signup(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      state = AuthStatus.authenticated;
    } catch (e) {
      state = AuthStatus.unauthenticated;
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    state = AuthStatus.unauthenticated;
  }
}
