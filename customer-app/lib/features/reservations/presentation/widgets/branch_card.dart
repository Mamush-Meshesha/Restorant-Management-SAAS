import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/glass_card.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../data/models/branch_model.dart';

class BranchCard extends ConsumerWidget {
  final Branch branch;
  final VoidCallback onTap;

  const BranchCard({
    Key? key,
    required this.branch,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fw = ref.watch(fontWeightProvider).weight;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    branch.name,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: fw,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: branch.waitTimeMinutes > 30 ? Colors.redAccent.withOpacity(0.2) : Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: branch.waitTimeMinutes > 30 ? Colors.redAccent : Colors.green,
                    ),
                  ),
                  child: Text(
                    'Wait: ${branch.waitTimeMinutes}m',
                    style: TextStyle(
                      color: branch.waitTimeMinutes > 30 ? Colors.redAccent : Colors.green,
                      fontWeight: fw,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, color: Colors.white54, size: 16),
                const SizedBox(width: 4),
                Text(
                  branch.address,
                  style: const TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ],
            ),
            const Spacer(),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                'Select >',
                style: TextStyle(color: AppTheme.primary, fontWeight: fw),
              ),
            )
          ],
        ),
      ),
    );
  }
}
