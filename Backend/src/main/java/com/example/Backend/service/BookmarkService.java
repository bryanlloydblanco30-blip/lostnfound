package com.example.Backend.service;

import com.example.Backend.dto.ItemDto;
import com.example.Backend.model.Bookmark;
import com.example.Backend.model.Item;
import com.example.Backend.model.User;
import com.example.Backend.repository.BookmarkRepository;
import com.example.Backend.repository.ItemRepository;
import com.example.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final ItemRepository     itemRepository;
    private final UserRepository     userRepository;
    private final ItemService        itemService;

    public List<ItemDto> getBookmarks(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return bookmarkRepository.findByUserId(user.getId())
                .stream()
                .map(b -> itemService.toDto(b.getItem(), user.getId()))
                .toList();
    }

    public void addBookmark(Long itemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (!bookmarkRepository.existsByUserIdAndItemId(user.getId(), itemId)) {
            bookmarkRepository.save(Bookmark.builder().user(user).item(item).build());
        }
    }

    @Transactional
    public void removeBookmark(Long itemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        bookmarkRepository.deleteByUserIdAndItemId(user.getId(), itemId);
    }
}
