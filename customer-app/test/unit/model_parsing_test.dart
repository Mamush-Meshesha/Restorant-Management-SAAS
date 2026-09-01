import 'package:flutter_test/flutter_test.dart';
import 'package:digital_hotel_customer/features/menu/data/models/menu_item_model.dart';
import 'package:digital_hotel_customer/features/reservations/data/models/branch_model.dart';

void main() {
  group('MenuItem Model', () {
    test('FromJson successfully parses valid JSON', () {
      final json = {
        'id': 1,
        'name': 'Pasta',
        'description': 'Delicious pasta',
        'price': 15.99,
        'image_url': 'pasta.jpg',
        'category_id': 2,
        'is_available': true,
      };

      final item = MenuItem.fromJson(json);

      expect(item.id, 1);
      expect(item.name, 'Pasta');
      expect(item.price, 15.99);
      expect(item.isAvailable, true);
    });
  });

  group('Branch Model', () {
    test('FromJson successfully parses branch with wait time', () {
      final json = {
        'id': 5,
        'name': 'Downtown',
        'address': '123 Test St',
        'wait_time_minutes': 25,
      };

      final branch = Branch.fromJson(json);

      expect(branch.id, 5);
      expect(branch.name, 'Downtown');
      expect(branch.waitTimeMinutes, 25);
    });

    test('FromJson uses defaults when values missing', () {
      final json = {
        'id': 6,
        'name': 'Uptown',
      };

      final branch = Branch.fromJson(json);

      expect(branch.address, 'No Address');
      expect(branch.waitTimeMinutes, 0);
    });
  });
}
