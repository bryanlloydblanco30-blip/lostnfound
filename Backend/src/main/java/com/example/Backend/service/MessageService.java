package com.example.Backend.service;

import com.example.Backend.dto.ConversationDto;
import com.example.Backend.dto.MessageDto;
import com.example.Backend.dto.MessageRequest;
import com.example.Backend.model.Message;
import com.example.Backend.model.User;
import com.example.Backend.repository.MessageRepository;
import com.example.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository    userRepository;

    // ── SEND A MESSAGE ────────────────────────────────────────────────────
    public MessageDto sendMessage(MessageRequest req, String senderEmail) {
        User sender   = userRepository.findByEmail(senderEmail).orElseThrow();
        User receiver = userRepository.findById(req.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Build a canonical conversation id (smaller id first)
        String convId = buildConversationId(sender.getId(), receiver.getId());

        Message msg = Message.builder()
                .conversationId(convId)
                .sender(sender)
                .receiver(receiver)
                .text(req.getText())
                .build();
        return toDto(messageRepository.save(msg));
    }

    // ── GET ALL MESSAGES IN A CONVERSATION ───────────────────────────────
    @Transactional
    public List<MessageDto> getMessages(String conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        messageRepository.markConversationAsRead(conversationId, user.getId());
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(this::toDto).toList();
    }

    // ── GET MESSAGES WITH A SPECIFIC USER (resolves conversationId) ──────
    @Transactional
    public List<MessageDto> getMessagesWith(Long receiverId, String userEmail) {
        User user     = userRepository.findByEmail(userEmail).orElseThrow();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String convId = buildConversationId(user.getId(), receiver.getId());
        messageRepository.markConversationAsRead(convId, user.getId());
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(convId)
                .stream().map(this::toDto).toList();
    }

    // ── GET CONVERSATION LIST FOR CURRENT USER ────────────────────────────
    public List<ConversationDto> getConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        List<String> convIds = messageRepository.findConversationIdsByUserId(user.getId());

        List<ConversationDto> result = new ArrayList<>();
        for (String convId : convIds) {
            messageRepository.findLatestMessageInConversation(convId).ifPresent(last -> {
                // Determine the other participant
                User other = last.getSender().getId().equals(user.getId())
                        ? last.getReceiver()
                        : last.getSender();

                long unread = messageRepository
                        .countByReceiverIdAndReadFalse(user.getId());

                result.add(ConversationDto.builder()
                        .conversationId(convId)
                        .otherUser(AuthService.toDto(other))
                        .lastMessage(last.getText())
                        .lastMessageAt(last.getCreatedAt())
                        .unreadCount(unread)
                        .build());
            });
        }
        return result;
    }

    // ── HELPERS ───────────────────────────────────────────────────────────
    private String buildConversationId(Long a, Long b) {
        return Math.min(a, b) + "_" + Math.max(a, b);
    }

    private MessageDto toDto(Message m) {
        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .sender(AuthService.toDto(m.getSender()))
                .receiver(AuthService.toDto(m.getReceiver()))
                .text(m.getText())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
