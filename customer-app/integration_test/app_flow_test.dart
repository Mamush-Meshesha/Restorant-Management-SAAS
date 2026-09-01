import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:digital_hotel_customer/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('End-to-End App Flow Test', (WidgetTester tester) async {
    // 1. Start App
    app.main();
    await tester.pumpAndSettle();

    // 2. Auth Flow (Login)
    // Find the login email field
    final emailField = find.byType(TextFormField).first;
    final passwordField = find.byType(TextFormField).last;
    final loginButton = find.text('LOG IN');

    expect(emailField, findsOneWidget);
    
    // Enter credentials
    await tester.enterText(emailField, 'test@digitalhotel.com');
    await tester.enterText(passwordField, 'password123');
    await tester.pumpAndSettle();

    // Tap Login
    await tester.tap(loginButton);
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // Verify Router redirected to Menu / Home
    expect(find.text('Our Menu'), findsOneWidget);

    // 3. Menu & Cart Flow
    // Find first 'Add' button on the menu
    final addButton = find.text('Add').first;
    expect(addButton, findsOneWidget);
    
    await tester.tap(addButton);
    await tester.pumpAndSettle(); // Wait for snackbar & FAB animation
    
    // Verify FAB appeared with badge '1'
    final fab = find.byType(FloatingActionButton);
    expect(fab, findsOneWidget);
    expect(find.text('1'), findsWidgets);
    
    // Open Cart
    await tester.tap(fab);
    await tester.pumpAndSettle();
    
    // Verify Bottom Sheet opened
    expect(find.text('Your Order'), findsOneWidget);
    
    // Find Place Order button
    final placeOrderBtn = find.text('PLACE ORDER');
    expect(placeOrderBtn, findsOneWidget);
    
    // Because we haven't scanned a QR, Place Order should show an error SnackBar
    await tester.tap(placeOrderBtn);
    await tester.pumpAndSettle();
    expect(find.text('Please scan a table QR code first!'), findsOneWidget);
    
    // Close bottom sheet
    // Navigate back to menu
    await tester.tapAt(const Offset(10, 10)); // Tap outside
    await tester.pumpAndSettle();

    // 4. Navigation Flow
    // Go to Profile tab
    final profileTab = find.text('Profile');
    await tester.tap(profileTab);
    await tester.pumpAndSettle();
    
    // Verify Profile screen loaded
    expect(find.text('My Profile'), findsOneWidget);
    
    // Logout
    final logoutButton = find.text('Log Out');
    await tester.ensureVisible(logoutButton);
    await tester.tap(logoutButton);
    await tester.pumpAndSettle(const Duration(seconds: 2));
    
    // Verify we are back on Auth Screen
    expect(find.text('Welcome Back'), findsOneWidget);
  });
}
