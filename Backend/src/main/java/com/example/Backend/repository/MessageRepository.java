package com.example.Backend.repository;

import com.example.Backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // All messages in a conversation, newest first
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    // Distinct conversations for a given user (as sender or receiver)
    @Query("""
        SELECT DISTINCT m.conversationId
        FROM Message m
        WHERE m.sender.id = :userId OR m.receiver.id = :userId
    """)
    List<String> findConversationIdsByUserId(Long userId);

    // Latest message per conversation
    @Query("""
        SELECT m FROM Message m
        WHERE m.conversationId = :convId
        ORDER BY m.createdAt DESC
        LIMIT 1
    """)
    java.util.Optional<Message> findLatestMessageInConversation(String convId);

    // Count unread messages directed to user
    long countByReceiverIdAndReadFalse(Long receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true WHERE m.conversationId = :convId AND m.receiver.id = :userId")
    void markConversationAsRead(String convId, Long userId);
}
