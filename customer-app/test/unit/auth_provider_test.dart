import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mocktail/mocktail.dart';
import 'package:digital_hotel_customer/features/auth/providers/auth_provider.dart';
import 'package:digital_hotel_customer/features/auth/data/auth_repository.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late ProviderContainer container;
  late MockAuthRepository mockRepo;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    mockRepo = MockAuthRepository();
    container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
  });

  tearDown(() {
    container.dispose();
  });

  test('Initial state should be loading (checking token)', () async {
    final notifier = container.read(authProvider.notifier);
    final state = container.read(authProvider);
    expect(state, AuthStatus.initial);
    await notifier.checkAuth();
  });

  test('Login successfully updates state to authenticated', () async {
    final notifier = container.read(authProvider.notifier);
    
    // Mock successful login
    when(() => mockRepo.login('test@test.com', 'password'))
        .thenAnswer((_) async => 'fake_token');
    
    await notifier.login('test@test.com', 'password');
    
    final state = container.read(authProvider);
    expect(state, AuthStatus.authenticated);
  });

  test('Login failure keeps state as unauthenticated', () async {
    final notifier = container.read(authProvider.notifier);
    
    // Override initial state for testing (assuming it finished loading and is unauthenticated)
    await notifier.logout(); 
    
    when(() => mockRepo.login('fail@test.com', 'wrong'))
        .thenThrow(Exception('Invalid credentials'));
    
    try {
      await notifier.login('fail@test.com', 'wrong');
    } catch (_) {}
    
    final state = container.read(authProvider);
    expect(state, AuthStatus.unauthenticated);
  });
  
  test('Logout updates state to unauthenticated', () async {
    final notifier = container.read(authProvider.notifier);
    await notifier.logout();
    
    final state = container.read(authProvider);
    expect(state, AuthStatus.unauthenticated);
  });
}
