import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../../../core/api/api_constants.dart';

class ChatMessage {
  final String text;
  final bool isMe;
  final DateTime timestamp;

  ChatMessage({required this.text, required this.isMe, required this.timestamp});
}

class ChatNotifier extends Notifier<List<ChatMessage>> {
  IO.Socket? _socket;

  @override
  List<ChatMessage> build() {
    ref.onDispose(() {
      _socket?.dispose();
    });
    _initSocket();
    return [];
  }

  void _initSocket() {
    // Determine socket URL from baseUrl (strip /api/v1)
    final socketUrl = ApiConstants.baseUrl.replaceAll('/api/v1', '');
    
    _socket = IO.io(socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket?.connect();

    _socket?.onConnect((_) {
      debugPrint('Socket connected');
    });

    _socket?.on('receive_message', (data) {
      final messageText = data['text'] as String?;
      if (messageText != null) {
        state = [
          ...state,
          ChatMessage(text: messageText, isMe: false, timestamp: DateTime.now()),
        ];
      }
    });

    _socket?.onDisconnect((_) => debugPrint('Socket disconnected'));
  }

  void sendMessage(String text) {
    if (text.trim().isEmpty) return;
    
    // Add to local state immediately
    state = [
      ...state,
      ChatMessage(text: text, isMe: true, timestamp: DateTime.now()),
    ];

    // Emit to server
    _socket?.emit('send_message', {'text': text});
  }

}

final chatProvider = NotifierProvider<ChatNotifier, List<ChatMessage>>(() {
  return ChatNotifier();
});
