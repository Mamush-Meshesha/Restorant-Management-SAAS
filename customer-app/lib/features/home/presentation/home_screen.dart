import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../scanner/presentation/scanner_screen.dart';
import '../../auth/providers/user_provider.dart';
import '../../menu/providers/menu_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionToken = ref.watch(sessionTokenProvider);
    final hasActiveSession = sessionToken != null;
    final fw = ref.watch(fontWeightProvider).weight;
    final userAsync = ref.watch(userProvider);
    final featuredItemAsync = ref.watch(featuredMenuItemProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Welcome to',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      userAsync.when(
                        data: (user) => Text(
                          user?.firstName != null ? 'Welcome, ${user!.firstName}' : 'Digital Hotel',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 24,
                            fontWeight: fw,
                            letterSpacing: 0.5,
                          ),
                        ),
                        loading: () => const SizedBox(height: 20, width: 100, child: CircularProgressIndicator(color: AppTheme.primary)),
                        error: (_, __) => Text(
                          'Digital Hotel',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontSize: 24,
                            fontWeight: fw,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppTheme.surfaceDark,
                    child: userAsync.when(
                      data: (user) => user?.firstName != null 
                        ? Text(user!.firstName!.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                        : const Icon(LucideIcons.user, color: Colors.white, size: 20),
                      loading: () => const Icon(LucideIcons.user, color: Colors.white, size: 20),
                      error: (_, __) => const Icon(LucideIcons.user, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Active Session or Scan Card
              if (hasActiveSession)
                _buildActiveSessionCard(context, fw)
              else
                _buildScanQRCard(context, fw),

              const SizedBox(height: 24),

              // Quick Actions
              Text(
                'Explore',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: fw,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildQuickActionCard(
                      context,
                      fw: fw,
                      title: 'Menu',
                      icon: LucideIcons.coffee,
                      onTap: () => context.go('/menu'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildQuickActionCard(
                      context,
                      fw: fw,
                      title: 'Reservations',
                      icon: LucideIcons.calendar,
                      onTap: () => context.go('/reservations'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Featured / Promotions Section
              Text(
                'Today\'s Specials',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: fw,
                ),
              ),
              const SizedBox(height: 12),
              _buildFeaturedCard(context, fw, featuredItemAsync),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScanQRCard(BuildContext context, FontWeight fw) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(LucideIcons.scan, color: AppTheme.primary, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dine In?',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: fw),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Scan the QR code on your table to view the menu and order.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: PrimaryButton(
              text: 'Scan QR Code',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ScannerScreen()),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveSessionCard(BuildContext context, FontWeight fw) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.greenAccent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.checkCircle, color: Colors.greenAccent, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Table Session Active',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: fw),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'You are connected to a table. You can now order from the menu.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: PrimaryButton(
              text: 'View Menu & Order',
              onPressed: () => context.go('/menu'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard(BuildContext context, {required String title, required IconData icon, required VoidCallback onTap, required FontWeight fw}) {
    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: fw,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturedCard(BuildContext context, FontWeight fw, AsyncValue featuredItemAsync) {
    return featuredItemAsync.when(
      data: (item) {
        if (item == null) {
          return const SizedBox.shrink(); // No featured items
        }
        return Container(
          width: double.infinity,
          height: 140,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            image: DecorationImage(
              image: (item.imageUrl != null && item.imageUrl!.isNotEmpty)
                  ? NetworkImage(item.imageUrl!)
                  : const NetworkImage('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80') as ImageProvider,
              fit: BoxFit.cover,
            ),
          ),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  Colors.black.withOpacity(0.9),
                  Colors.transparent,
                ],
              ),
            ),
            padding: const EdgeInsets.all(16),
            alignment: Alignment.bottomLeft,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Popular',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: fw),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  item.name,
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: fw),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  item.description,
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
      loading: () => Container(
        width: double.infinity,
        height: 140,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: Colors.white.withOpacity(0.05),
        ),
        child: const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
