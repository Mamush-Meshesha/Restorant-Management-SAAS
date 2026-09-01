import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/glass_card.dart';

// A simple provider to store the active session token (QR code token)
final sessionTokenProvider = NotifierProvider<SessionTokenNotifier, String?>(() {
  return SessionTokenNotifier();
});

class SessionTokenNotifier extends Notifier<String?> {
  @override
  String? build() => null;
  void setToken(String? token) => state = token;
}

class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen> {
  bool _isProcessing = false;
  late MobileScannerController cameraController;

  @override
  void initState() {
    super.initState();
    cameraController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
    );
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final barcode = barcodes.first;
      if (barcode.rawValue != null) {
        setState(() {
          _isProcessing = true;
        });

        // The raw value could be a URL or a raw token. 
        // For simplicity, let's assume the QR code is just the token string (e.g. "table-1-token")
        // or a URL like "http://localhost:3002/session/demo-token", we extract the last part.
        
        String token = barcode.rawValue!;
        if (token.contains('/session/')) {
          token = token.split('/session/').last;
        }

        // Save token to state
        ref.read(sessionTokenProvider.notifier).setToken(token);

        // Show success and navigate
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Joined Table Session Successfully!'),
            backgroundColor: AppTheme.primary,
          ),
        );

        // Pause camera and route to menu
        cameraController.stop();
        context.go('/menu');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fw = ref.watch(fontWeightProvider).weight;
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(
            controller: cameraController,
            onDetect: _onDetect,
          ),
          
          // Overlay UI
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => context.pop(),
                      ),
                      Expanded(
                        child: Text(
                          'Scan Table QR Code',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: fw),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(width: 48), // Balance for the back button
                    ],
                  ),
                ),
                
                const Spacer(),
                
                // Scanner Reticle Overlay
                Center(
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.primary, width: 2),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: _isProcessing 
                        ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                        : null,
                  ),
                ),
                
                const Spacer(),
                
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: GlassCard(
                    child: const Text(
                      'Point your camera at the QR code on your table to view the menu and start ordering.',
                      style: TextStyle(color: Colors.white, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
