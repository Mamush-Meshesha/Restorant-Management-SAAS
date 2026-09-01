import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:network_image_mock/network_image_mock.dart';
import 'package:digital_hotel_customer/features/menu/presentation/widgets/menu_item_card.dart';
import 'package:digital_hotel_customer/features/menu/data/models/menu_item_model.dart';
import 'package:digital_hotel_customer/features/cart/providers/cart_provider.dart';

void main() {
  final testMenuItem = MenuItem(
    id: 1,
    name: 'Gourmet Burger',
    description: 'A delicious test burger',
    price: 12.50,
    imageUrl: 'https://example.com/burger.jpg',
    categoryId: 1,
    isAvailable: true,
  );

  testWidgets('MenuItemCard renders correctly and adds to cart', (WidgetTester tester) async {
    // network_image_mock prevents CachedNetworkImage from throwing HTTP exceptions during tests
    await mockNetworkImagesFor(() async {
      final container = ProviderContainer();
      
      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: MaterialApp(
            home: Scaffold(
              body: MenuItemCard(item: testMenuItem),
            ),
          ),
        ),
      );

      // Verify text elements are rendered
      expect(find.text('Gourmet Burger'), findsOneWidget);
      expect(find.text('A delicious test burger'), findsOneWidget);
      expect(find.text('\$12.50'), findsOneWidget);

      // Verify initial cart state
      expect(container.read(cartProvider), isEmpty);

      // Tap the Add button
      final addButton = find.text('Add');
      expect(addButton, findsOneWidget);
      
      await tester.tap(addButton);
      await tester.pump(); // Use pump instead of pumpAndSettle to avoid timing out on infinite animations or Snackbars

      // Verify item was added to cart provider
      expect(container.read(cartProvider).length, 1);
      expect(container.read(cartProvider).first.menuItem.name, 'Gourmet Burger');
    });
  });
}
