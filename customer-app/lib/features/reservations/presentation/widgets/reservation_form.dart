import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../data/models/branch_model.dart';
import '../../providers/reservation_provider.dart';
import '../../../../core/theme/theme_provider.dart';

class ReservationForm extends ConsumerStatefulWidget {
  final Branch branch;

  const ReservationForm({Key? key, required this.branch}) : super(key: key);

  @override
  ConsumerState<ReservationForm> createState() => _ReservationFormState();
}

class _ReservationFormState extends ConsumerState<ReservationForm> {
  late DateTime _focusedDay;
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _focusedDay = DateTime.now();
    _selectedDay = _focusedDay;
    
    // Automatically set branch in state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(reservationFormProvider.notifier).setBranch(widget.branch.id);
      ref.read(reservationFormProvider.notifier).setDate(_selectedDay!);
    });
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(reservationFormProvider);
    final fw = ref.watch(fontWeightProvider).weight;

    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.secondary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text('Book at ${widget.branch.name}', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: fw)),
            const SizedBox(height: 24),
            
            // Calendar
            TableCalendar(
              firstDay: DateTime.now(),
              lastDay: DateTime.now().add(const Duration(days: 90)),
              focusedDay: _focusedDay,
              selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
              onDaySelected: (selectedDay, focusedDay) {
                setState(() {
                  _selectedDay = selectedDay;
                  _focusedDay = focusedDay;
                });
                ref.read(reservationFormProvider.notifier).setDate(selectedDay);
              },
              calendarStyle: CalendarStyle(
                defaultTextStyle: const TextStyle(color: Colors.white),
                weekendTextStyle: const TextStyle(color: Colors.white70),
                selectedDecoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                todayDecoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.3), shape: BoxShape.circle),
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
                titleTextStyle: TextStyle(color: Colors.white, fontSize: 16),
                leftChevronIcon: Icon(Icons.chevron_left, color: Colors.white),
                rightChevronIcon: Icon(Icons.chevron_right, color: Colors.white),
              ),
              daysOfWeekStyle: const DaysOfWeekStyle(
                weekdayStyle: TextStyle(color: Colors.white54),
                weekendStyle: TextStyle(color: Colors.white54),
              ),
            ),
            
            const SizedBox(height: 24),
            const Text('Party Size', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 8),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline, color: Colors.white),
                  onPressed: () {
                    if (formState.partySize > 1) {
                      ref.read(reservationFormProvider.notifier).setPartySize(formState.partySize - 1);
                    }
                  },
                ),
                Text('${formState.partySize}', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: fw)),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
                  onPressed: () {
                    if (formState.partySize < 20) {
                      ref.read(reservationFormProvider.notifier).setPartySize(formState.partySize + 1);
                    }
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'SUBMIT REQUEST',
              onPressed: () {
                // TODO: Wire to backend API
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reservation Requested Successfully!'), backgroundColor: AppTheme.primary),
                );
              },
            ),
            const SizedBox(height: 24), // padding for bottom nav
          ],
        ),
      ),
    );
  }
}
