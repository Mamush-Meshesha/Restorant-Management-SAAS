import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/menu_provider.dart';
import '../../../core/theme/theme_provider.dart';
import 'widgets/category_filter_list.dart';
import 'widgets/menu_item_card.dart';
import '../../cart/providers/cart_provider.dart';
import '../../cart/presentation/widgets/cart_bottom_sheet.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MenuScreen extends ConsumerWidget {
  const MenuScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(menuCategoriesProvider);
    final itemsAsync = ref.watch(filteredMenuItemsProvider);
    final cartItemCount = ref.watch(cartProvider.notifier).totalItems;
    final fw = ref.watch(fontWeightProvider).weight;

    final isLoading = categoriesAsync.isLoading || itemsAsync.isLoading;
    final hasError = categoriesAsync.hasError || itemsAsync.hasError;

    return Scaffold(
      backgroundColor: AppTheme.secondary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          'Our Menu',
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
            color: AppTheme.primary,
            fontSize: 28,
          ),
        ),
        centerTitle: false,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (isLoading)
            _buildSkeletonLoader(context)
          else if (hasError)
            const Expanded(
              child: Center(
                child: Text('Failed to load menu. Please try again.', style: TextStyle(color: Colors.redAccent)),
              ),
            )
          else ...[
            // Categories
            Padding(
              padding: const EdgeInsets.only(top: 8.0, bottom: 16.0),
              child: CategoryFilterList(categories: categoriesAsync.value!),
            ),

            // Menu Items Grid
            Expanded(
              child: itemsAsync.value!.isEmpty
                  ? const Center(
                      child: Text('No items available in this category.', style: TextStyle(color: Colors.white70)),
                    )
                  : GridView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.85,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: itemsAsync.value!.length,
                      itemBuilder: (context, index) {
                        return MenuItemCard(item: itemsAsync.value![index]);
                      },
                    ),
            ),
          ],
        ],
      ),
      floatingActionButton: cartItemCount > 0
          ? FloatingActionButton.extended(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => const CartBottomSheet(),
                );
              },
              backgroundColor: AppTheme.primary,
              icon: const Icon(LucideIcons.shoppingCart, color: Colors.white),
              label: Text(
                '$cartItemCount items',
                style: TextStyle(color: Colors.white, fontWeight: fw),
              ),
            )
          : null,
    );
  }

  Widget _buildSkeletonLoader(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skeleton Categories
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const NeverScrollableScrollPhysics(),
              child: Row(
                children: List.generate(4, (index) => Container(
                  margin: const EdgeInsets.only(right: 12),
                  width: 80,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(18),
                  ),
                )),
              ),
            ),
          ),
          // Skeleton Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.85,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: 6,
              itemBuilder: (context, index) {
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
