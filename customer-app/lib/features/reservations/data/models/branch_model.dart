class Branch {
  final int id;
  final String name;
  final String address;
  final int waitTimeMinutes;

  Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.waitTimeMinutes,
  });

  factory Branch.fromJson(Map<String, dynamic> json) {
    return Branch(
      id: json['id'],
      name: json['name'],
      address: json['address'] ?? 'No Address',
      waitTimeMinutes: json['wait_time_minutes'] ?? 0,
    );
  }
}
