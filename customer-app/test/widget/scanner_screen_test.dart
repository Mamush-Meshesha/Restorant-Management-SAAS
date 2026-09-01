import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:digital_hotel_customer/features/scanner/presentation/scanner_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('ScannerScreen renders correctly', (WidgetTester tester) async {
    // Provide a mocked router or simply wrap in MaterialApp to handle GoRouter
    // Since ScannerScreen uses context.pop() and context.go(), we might just
    // want to verify it renders the UI correctly first.
    
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: ScannerScreen(),
        ),
      ),
    );

    // Give time for UI to settle (though we avoid pumpAndSettle if there's infinite animations)
    await tester.pump();

    // Verify UI components
    expect(find.text('Scan Table QR Code'), findsOneWidget);
    expect(find.text('Point your camera at the QR code on your table to view the menu and start ordering.'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });
}
