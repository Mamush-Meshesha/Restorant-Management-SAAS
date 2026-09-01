class Reservation {
  final int id;
  final int branchId;
  final DateTime reservationTime;
  final int partySize;
  final String status;

  Reservation({
    required this.id,
    required this.branchId,
    required this.reservationTime,
    required this.partySize,
    required this.status,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id'],
      branchId: json['branch_id'],
      reservationTime: DateTime.parse(json['reservation_time']),
      partySize: json['party_size'],
      status: json['status'],
    );
  }
}
