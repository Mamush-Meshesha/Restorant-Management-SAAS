import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/dio_client.dart';
import 'models/menu_category_model.dart';
import 'models/menu_item_model.dart';

final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  return MenuRepository(ref.watch(dioProvider));
});

class MenuRepository {
  final Dio _dio;

  MenuRepository(this._dio);

  Future<List<MenuCategory>> getCategories() async {
    try {
      final response = await _dio.get('/menu/categories');
      final List rawData = response.data is List ? response.data : response.data['data'] ?? [];
      return rawData.map((e) => MenuCategory.fromJson(e)).toList();
    } catch (e) {
      debugPrint('Categories Error: $e');
      throw Exception('Failed to load categories');
    }
  }

  Future<List<MenuItem>> getItems() async {
    try {
      final response = await _dio.get('/menu/items');
      final List rawData = response.data is List ? response.data : response.data['data'] ?? [];
      return rawData.map((e) => MenuItem.fromJson(e)).toList();
    } catch (e) {
      debugPrint('Items Error: $e');
      throw Exception('Failed to load items');
    }
  }
}
