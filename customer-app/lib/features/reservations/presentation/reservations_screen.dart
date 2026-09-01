import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/reservation_provider.dart';
import 'widgets/branch_card.dart';
import 'widgets/reservation_form.dart';
import '../../../core/theme/theme_provider.dart';

class ReservationsScreen extends ConsumerWidget {
  const ReservationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final branchesAsync = ref.watch(branchesProvider);
    final myReservationsAsync = ref.watch(myReservationsProvider);
    final fw = ref.watch(fontWeightProvider).weight;

    return Scaffold(
      backgroundColor: AppTheme.secondary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          'Reservations',
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
            color: AppTheme.primary,
            fontSize: 28,
          ),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Branches Section
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: Text(
                'Book a Table',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: fw),
              ),
            ),
            SizedBox(
              height: 160,
              child: branchesAsync.when(
                data: (branches) {
                  if (branches.isEmpty) {
                    return const Center(child: Text('No branches available.', style: TextStyle(color: Colors.white70)));
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    scrollDirection: Axis.horizontal,
                    itemCount: branches.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 16),
                    itemBuilder: (context, index) {
                      final branch = branches[index];
                      return SizedBox(
                        width: 280,
                        child: BranchCard(
                          branch: branch,
                          onTap: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (context) => ReservationForm(branch: branch),
                            );
                          },
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
                error: (err, _) => const Center(child: Text('Failed to load branches', style: TextStyle(color: Colors.redAccent))),
              ),
            ),

            const SizedBox(height: 32),
            
            // My Reservations Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                'My Bookings',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: fw),
              ),
            ),
            const SizedBox(height: 16),
            
            myReservationsAsync.when(
              data: (reservations) {
                if (reservations.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text('You have no upcoming reservations.', style: TextStyle(color: Colors.white54)),
                  );
                }
                
                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: reservations.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final res = reservations[index];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                DateFormat('MMM d, yyyy').format(res.reservationTime),
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: fw),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Party of ${res.partySize}',
                                style: const TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: res.status == 'approved' ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              res.status.toUpperCase(),
                              style: TextStyle(
                                color: res.status == 'approved' ? Colors.green : Colors.orange,
                                fontSize: 12,
                                fontWeight: fw,
                              ),
                            ),
                          )
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
              error: (err, _) => const Center(child: Text('Failed to load reservations', style: TextStyle(color: Colors.redAccent))),
            ),
          ],
        ),
      ),
    );
  }
}
