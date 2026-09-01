import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/menu_repository.dart';
import '../data/models/menu_category_model.dart';
import '../data/models/menu_item_model.dart';

final menuCategoriesProvider = FutureProvider<List<MenuCategory>>((ref) async {
  final repo = ref.watch(menuRepositoryProvider);
  return repo.getCategories();
});

final menuItemsProvider = FutureProvider<List<MenuItem>>((ref) async {
  final repo = ref.watch(menuRepositoryProvider);
  return repo.getItems();
});

final selectedCategoryProvider = NotifierProvider<SelectedCategoryNotifier, String?>(() {
  return SelectedCategoryNotifier();
});

class SelectedCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  void select(String? categoryId) => state = categoryId;
}

// A derived provider that returns items filtered by the selected category
final filteredMenuItemsProvider = Provider<AsyncValue<List<MenuItem>>>((ref) {
  final itemsAsync = ref.watch(menuItemsProvider);
  final selectedCategoryId = ref.watch(selectedCategoryProvider);

  return itemsAsync.whenData((items) {
    if (selectedCategoryId == null) return items;
    return items.where((item) => item.categoryId == selectedCategoryId).toList();
  });
});

// A derived provider that returns a featured item for the home screen
final featuredMenuItemProvider = Provider<AsyncValue<MenuItem?>>((ref) {
  final itemsAsync = ref.watch(menuItemsProvider);
  return itemsAsync.whenData((items) {
    if (items.isEmpty) return null;
    // Try to find an item with an image
    final withImage = items.where((item) => item.imageUrl != null && item.imageUrl!.isNotEmpty).toList();
    if (withImage.isNotEmpty) {
      return withImage.first;
    }
    return items.first;
  });
});
