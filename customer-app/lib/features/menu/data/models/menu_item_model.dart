class MenuItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? imageUrl;
  final String categoryId;
  final bool isAvailable;

  MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.imageUrl,
    required this.categoryId,
    required this.isAvailable,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'].toString(),
      name: json['name'],
      description: json['description'] ?? '',
      price: ((json['base_price'] ?? json['price'] ?? 0) as num).toDouble(),
      imageUrl: json['image_url'],
      categoryId: json['category_id'].toString(),
      isAvailable: json['is_available'] ?? true,
    );
  }
}
