class UserModel {
  final String id;
  final String? username;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? createdAt; // from backend last_login or we can use generic

  UserModel({
    required this.id,
    this.username,
    required this.email,
    this.firstName,
    this.lastName,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      username: json['username'],
      email: json['email'] ?? '',
      firstName: json['first_name'],
      lastName: json['last_name'],
      createdAt: json['last_login'], // fallback to last_login if created_at isn't sent
    );
  }
}
