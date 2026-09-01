import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/reservation_repository.dart';
import '../data/models/branch_model.dart';
import '../data/models/reservation_model.dart';

final branchesProvider = FutureProvider<List<Branch>>((ref) async {
  final repo = ref.watch(reservationRepositoryProvider);
  return repo.getBranches();
});

final myReservationsProvider = FutureProvider<List<Reservation>>((ref) async {
  final repo = ref.watch(reservationRepositoryProvider);
  return repo.getMyReservations();
});

class ReservationFormState {
  final int? branchId;
  final DateTime? selectedDate;
  final int partySize;
  final String notes;

  ReservationFormState({
    this.branchId,
    this.selectedDate,
    this.partySize = 2,
    this.notes = '',
  });

  ReservationFormState copyWith({
    int? branchId,
    DateTime? selectedDate,
    int? partySize,
    String? notes,
  }) {
    return ReservationFormState(
      branchId: branchId ?? this.branchId,
      selectedDate: selectedDate ?? this.selectedDate,
      partySize: partySize ?? this.partySize,
      notes: notes ?? this.notes,
    );
  }
}

final reservationFormProvider = NotifierProvider<ReservationFormNotifier, ReservationFormState>(() {
  return ReservationFormNotifier();
});

class ReservationFormNotifier extends Notifier<ReservationFormState> {
  @override
  ReservationFormState build() {
    return ReservationFormState();
  }

  void setBranch(int branchId) {
    state = state.copyWith(branchId: branchId);
  }

  void setDate(DateTime date) {
    state = state.copyWith(selectedDate: date);
  }

  void setPartySize(int size) {
    state = state.copyWith(partySize: size);
  }
  
  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  void clear() {
    state = ReservationFormState();
  }
}
