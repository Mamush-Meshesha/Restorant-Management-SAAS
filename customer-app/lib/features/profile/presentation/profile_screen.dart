import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/providers/user_provider.dart';
import '../../chat/presentation/chat_screen.dart';
import '../../../shared/widgets/glass_card.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProvider);
    
    return Scaffold(
      backgroundColor: AppTheme.secondary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          'My Profile',
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
            color: AppTheme.primary,
            fontSize: 28,
          ),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // User Header
            GlassCard(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.primary.withOpacity(0.2),
                    child: const Icon(LucideIcons.user, size: 32, color: AppTheme.primary),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      userAsync.when(
                        data: (user) => Text(
                          user?.firstName != null ? '${user!.firstName} ${user.lastName ?? ''}' : 'Valued Guest',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
                        ),
                        loading: () => const SizedBox(
                          height: 20, 
                          width: 100, 
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary)
                        ),
                        error: (_, __) => Text(
                          'Valued Guest',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
                        ),
                      ),
                      const SizedBox(height: 4),
                      userAsync.when(
                        data: (user) {
                          String year = '2026';
                          if (user?.createdAt != null) {
                            try {
                              year = DateTime.parse(user!.createdAt!).year.toString();
                            } catch (_) {}
                          }
                          return Text(
                            'Member since $year',
                            style: const TextStyle(color: Colors.white54, fontSize: 14),
                          );
                        },
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const Text(
                          'Member since 2026',
                          style: TextStyle(color: Colors.white54, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Menu Items
            _buildMenuItem(context, icon: LucideIcons.history, title: 'Past Orders'),
            _buildMenuItem(context, icon: LucideIcons.creditCard, title: 'Payment Methods'),
            
            const SizedBox(height: 24),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'App Settings',
                style: TextStyle(color: Colors.white54, fontSize: 14, fontWeight: ref.watch(fontWeightProvider).weight),
              ),
            ),
            const SizedBox(height: 12),
            _buildFontSizeSetting(context, ref),
            
            const SizedBox(height: 16),
            _buildFontWeightSetting(context, ref),
            
            const SizedBox(height: 32),
            
            // Logout
            InkWell(
              onTap: () {
                ref.read(authProvider.notifier).logout();
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(LucideIcons.logOut, color: Colors.redAccent),
                    const SizedBox(width: 8),
                    Text('Log Out', style: TextStyle(color: Colors.redAccent, fontSize: 16, fontWeight: ref.watch(fontWeightProvider).weight)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      
      // Live Chat FAB
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => SizedBox(
              height: MediaQuery.of(context).size.height * 0.8,
              child: const ChatScreen(),
            ),
          );
        },
        backgroundColor: AppTheme.primary,
        child: const Icon(LucideIcons.messageSquare, color: Colors.white),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, {required IconData icon, required String title}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Icon(icon, color: Colors.white70),
              const SizedBox(width: 16),
              Expanded(
                child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16)),
              ),
              const Icon(Icons.chevron_right, color: Colors.white38),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFontSizeSetting(BuildContext context, WidgetRef ref) {
    final currentScale = ref.watch(themeProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.text_fields, color: Colors.white70),
              const SizedBox(width: 16),
              const Expanded(
                child: Text('Font Size', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
              Text(
                currentScale.name.toUpperCase(),
                style: TextStyle(color: AppTheme.primary, fontWeight: ref.watch(fontWeightProvider).weight),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: FontSizeScale.values.map((scale) {
              final isSelected = currentScale == scale;
              return InkWell(
                onTap: () {
                  ref.read(themeProvider.notifier).setScale(scale);
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : Colors.transparent,
                    border: Border.all(color: isSelected ? AppTheme.primary : Colors.white24),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'A',
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontSize: 14 * scale.scale,
                      fontWeight: isSelected ? ref.watch(fontWeightProvider).weight : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFontWeightSetting(BuildContext context, WidgetRef ref) {
    final currentWeight = ref.watch(fontWeightProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.format_bold, color: Colors.white70),
              const SizedBox(width: 16),
              const Expanded(
                child: Text('Font Weight', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
              Text(
                currentWeight.name.toUpperCase(),
                style: TextStyle(color: AppTheme.primary, fontWeight: currentWeight.weight),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: FontWeightScale.values.map((weight) {
              final isSelected = currentWeight == weight;
              final weightLabel = weight.name.substring(0, 1).toUpperCase() + weight.name.substring(1);
              
              return InkWell(
                onTap: () {
                  ref.read(fontWeightProvider.notifier).setWeight(weight);
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : Colors.transparent,
                    border: Border.all(color: isSelected ? AppTheme.primary : Colors.white24),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    weightLabel,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontSize: 14,
                      fontWeight: weight.weight,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
