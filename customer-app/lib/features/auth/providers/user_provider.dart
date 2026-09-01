import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import '../data/models/user_model.dart';
import 'auth_provider.dart';

final userProvider = FutureProvider<UserModel?>((ref) async {
  final authStatus = ref.watch(authProvider);
  
  // Only fetch user if authenticated
  if (authStatus == AuthStatus.authenticated) {
    final repo = ref.watch(authRepositoryProvider);
    return await repo.getMe();
  }
  
  return null;
});
