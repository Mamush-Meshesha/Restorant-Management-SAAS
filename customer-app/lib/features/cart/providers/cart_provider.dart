import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../menu/data/models/menu_item_model.dart';

class CartItem {
  final MenuItem menuItem;
  final int quantity;
  final String? instructions;

  CartItem({
    required this.menuItem,
    required this.quantity,
    this.instructions,
  });

  CartItem copyWith({
    MenuItem? menuItem,
    int? quantity,
    String? instructions,
  }) {
    return CartItem(
      menuItem: menuItem ?? this.menuItem,
      quantity: quantity ?? this.quantity,
      instructions: instructions ?? this.instructions,
    );
  }

  double get totalPrice => menuItem.price * quantity;
}

class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() => [];

  void addItem(MenuItem item, {int quantity = 1, String? instructions}) {
    final existingIndex = state.indexWhere((element) => element.menuItem.id == item.id);
    if (existingIndex >= 0) {
      final updatedCart = List<CartItem>.from(state);
      updatedCart[existingIndex] = updatedCart[existingIndex].copyWith(
        quantity: updatedCart[existingIndex].quantity + quantity,
      );
      state = updatedCart;
    } else {
      state = [...state, CartItem(menuItem: item, quantity: quantity, instructions: instructions)];
    }
  }

  void removeItem(String menuItemId) {
    state = state.where((item) => item.menuItem.id != menuItemId).toList();
  }

  void updateQuantity(String menuItemId, int quantity) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    final updatedCart = List<CartItem>.from(state);
    final index = updatedCart.indexWhere((element) => element.menuItem.id == menuItemId);
    if (index >= 0) {
      updatedCart[index] = updatedCart[index].copyWith(quantity: quantity);
      state = updatedCart;
    }
  }

  void clearCart() {
    state = [];
  }

  double get subtotal => state.fold(0, (sum, item) => sum + item.totalPrice);
  double get tax => subtotal * 0.10; // Assuming 10% tax for display purposes
  double get total => subtotal + tax;
  int get totalItems => state.fold(0, (sum, item) => sum + item.quantity);
}

final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(() {
  return CartNotifier();
});
