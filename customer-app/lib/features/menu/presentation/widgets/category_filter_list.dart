import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../providers/menu_provider.dart';
import '../../data/models/menu_category_model.dart';
import '../../../../core/theme/theme_provider.dart';

class CategoryFilterList extends ConsumerWidget {
  final List<MenuCategory> categories;

  const CategoryFilterList({Key? key, required this.categories}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedId = ref.watch(selectedCategoryProvider);

    return SizedBox(
      height: 48,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length + 1,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          if (index == 0) {
            // "All" filter
            final isSelected = selectedId == null;
            return _buildChip(
              context,
              ref,
              label: 'All',
              isSelected: isSelected,
              onTap: () => ref.read(selectedCategoryProvider.notifier).state = null,
            );
          }

          final category = categories[index - 1];
          final isSelected = selectedId == category.id;

          return _buildChip(
            context,
            ref,
            label: category.name,
            isSelected: isSelected,
            onTap: () => ref.read(selectedCategoryProvider.notifier).state = category.id,
          );
        },
      ),
    );
  }

  Widget _buildChip(
    BuildContext context,
    WidgetRef ref, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final fw = ref.watch(fontWeightProvider).weight;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.1),
          ),
          boxShadow: isSelected ? [
            BoxShadow(
              color: AppTheme.primary.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            )
          ] : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white60,
            fontWeight: isSelected ? fw : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
