import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:digital_hotel_customer/features/cart/providers/cart_provider.dart';
import 'package:digital_hotel_customer/features/menu/data/models/menu_item_model.dart';

void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  final testMenuItem = MenuItem(
    id: 1,
    name: 'Burger',
    description: 'Juicy burger',
    price: 10.0,
    imageUrl: 'burger.jpg',
    categoryId: 1,
    isAvailable: true,
  );

  test('Initial cart state is empty', () {
    final cartState = container.read(cartProvider);
    final notifier = container.read(cartProvider.notifier);
    expect(cartState, isEmpty);
    expect(notifier.subtotal, 0.0);
    expect(notifier.tax, 0.0);
    expect(notifier.total, 0.0);
  });

  test('Adding item to cart increases quantity and updates totals', () {
    final notifier = container.read(cartProvider.notifier);
    
    notifier.addItem(testMenuItem);
    
    var state = container.read(cartProvider);
    expect(state.length, 1);
    expect(state.first.quantity, 1);
    expect(notifier.subtotal, 10.0);
    expect(notifier.tax, 1.0); // 10% tax
    expect(notifier.total, 11.0);
    
    // Add same item again
    notifier.addItem(testMenuItem);
    
    state = container.read(cartProvider);
    expect(state.length, 1); // Should still be 1 unique item
    expect(state.first.quantity, 2); // Quantity should be 2
    expect(notifier.subtotal, 20.0);
    expect(notifier.total, 22.0);
  });

  test('Removing item updates cart correctly', () {
    final notifier = container.read(cartProvider.notifier);
    notifier.addItem(testMenuItem);
    notifier.addItem(testMenuItem);
    
    notifier.removeItem(testMenuItem.id);
    
    final state = container.read(cartProvider);
    expect(state, isEmpty);
  });

  test('Removing last instance of item clears it from cart', () {
    final notifier = container.read(cartProvider.notifier);
    notifier.addItem(testMenuItem);
    
    notifier.removeItem(testMenuItem.id);
    
    final state = container.read(cartProvider);
    expect(state, isEmpty);
    expect(notifier.subtotal, 0.0);
  });

  test('clearCart empties everything', () {
    final notifier = container.read(cartProvider.notifier);
    notifier.addItem(testMenuItem);
    notifier.clearCart();
    
    final state = container.read(cartProvider);
    expect(state, isEmpty);
    expect(notifier.total, 0.0);
  });
}
