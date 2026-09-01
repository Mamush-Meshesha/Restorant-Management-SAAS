import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/dio_client.dart';
import 'models/branch_model.dart';
import 'models/reservation_model.dart';

final reservationRepositoryProvider = Provider<ReservationRepository>((ref) {
  return ReservationRepository(ref.watch(dioProvider));
});

class ReservationRepository {
  final Dio _dio;

  ReservationRepository(this._dio);

  Future<List<Branch>> getBranches() async {
    try {
      final response = await _dio.get('/branch/public');
      final List rawData = response.data is List ? response.data : response.data['data'] ?? [];
      return rawData.map((e) => Branch.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load branches');
    }
  }

  Future<List<Reservation>> getMyReservations() async {
    try {
      final response = await _dio.get('/customer-reservation/my-reservations');
      return (response.data as List).map((e) => Reservation.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> createReservation(Map<String, dynamic> data) async {
    try {
      await _dio.post('/customer-reservation/create', data: data);
    } catch (e) {
      throw Exception('Failed to create reservation');
    }
  }
}
