import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../providers/cart_provider.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../../scanner/presentation/scanner_screen.dart';

class CartBottomSheet extends ConsumerWidget {
  const CartBottomSheet({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);
    final currencyFormat = NumberFormat.simpleCurrency(name: 'USD');
    final fw = ref.watch(fontWeightProvider).weight;

    if (cartItems.isEmpty) {
      return Container(
        height: 200,
        decoration: const BoxDecoration(
          color: AppTheme.secondary,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: const Center(
          child: Text(
            'Your cart is empty',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
      );
    }

    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.secondary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Your Order',
            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: fw),
          ),
          const SizedBox(height: 16),
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: cartItems.length,
              separatorBuilder: (_, __) => const Divider(color: Colors.white10),
              itemBuilder: (context, index) {
                final item = cartItems[index];
                return Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.menuItem.name,
                            style: const TextStyle(color: Colors.white, fontSize: 16),
                          ),
                          Text(
                            currencyFormat.format(item.menuItem.price),
                            style: const TextStyle(color: Colors.white54, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline, color: Colors.white54),
                          onPressed: () => cartNotifier.updateQuantity(item.menuItem.id, item.quantity - 1),
                        ),
                        Text(
                          '${item.quantity}',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: fw),
                        ),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
                          onPressed: () => cartNotifier.updateQuantity(item.menuItem.id, item.quantity + 1),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
          const Divider(color: Colors.white24, height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Subtotal', style: TextStyle(color: Colors.white70)),
              Text(currencyFormat.format(cartNotifier.subtotal), style: const TextStyle(color: Colors.white)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Tax (10%)', style: TextStyle(color: Colors.white70)),
              Text(currencyFormat.format(cartNotifier.tax), style: const TextStyle(color: Colors.white)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: fw)),
              Text(
                currencyFormat.format(cartNotifier.total),
                style: TextStyle(color: AppTheme.primary, fontSize: 24, fontWeight: fw),
              ),
            ],
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            text: 'PLACE ORDER',
            onPressed: () {
              final sessionToken = ref.read(sessionTokenProvider);
              if (sessionToken == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please scan a table QR code first!'), backgroundColor: Colors.redAccent),
                );
                Navigator.pop(context);
                return;
              }

              // TODO: Wire to /order/create API with sessionToken
              cartNotifier.clearCart();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Order placed successfully!'), backgroundColor: AppTheme.primary),
              );
            },
          ),
        ],
      ),
    );
  }
}
