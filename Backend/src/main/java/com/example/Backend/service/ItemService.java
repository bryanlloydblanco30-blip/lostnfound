package com.example.Backend.service;

import com.example.Backend.dto.ItemDto;
import com.example.Backend.dto.ItemRequest;
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
public class ItemService {

    private final ItemRepository     itemRepository;
    private final UserRepository     userRepository;
    private final BookmarkRepository bookmarkRepository;

    // ── FETCH ALL with optional filters ──────────────────────────────────
    public List<ItemDto> searchItems(String search, String status,
                                     String category, String location,
                                     String userEmail) {
        String s = (search   != null && !search.isBlank())   ? search   : "";
        String st = (status  != null && !status.isBlank())   ? status   : "";
        String c  = (category!= null && !category.isBlank()) ? category : "";
        String l  = (location!= null && !location.isBlank()) ? location : "";

        List<Item> items = itemRepository.searchItems(s, st, c, l);
        Long userId = resolveUserId(userEmail);
        return items.stream().map(item -> toDto(item, userId)).toList();
    }

    // ── GET SINGLE ITEM ───────────────────────────────────────────────────
    public ItemDto getItemById(Long id, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Long userId = resolveUserId(userEmail);
        return toDto(item, userId);
    }

    // ── MY REPORTS (items posted by current user) ─────────────────────────
    public List<ItemDto> getMyItems(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return itemRepository.findByUserId(user.getId())
                .stream().map(item -> toDto(item, user.getId())).toList();
    }

    // ── CREATE ────────────────────────────────────────────────────────────
    public ItemDto createItem(ItemRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Item item = Item.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .status(req.getStatus() != null ? req.getStatus() : "Lost")
                .location(req.getLocation())
                .dateStr(req.getDateStr())
                .image(req.getImage())
                .pinX(req.getPinX())
                .pinY(req.getPinY())
                .founder(user.getName() != null ? user.getName() : user.getEmail())
                .user(user)
                .build();
        Item saved = itemRepository.save(item);
        return toDto(saved, user.getId());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────
    public ItemDto updateItem(Long id, ItemRequest req, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (!item.getUser().getId().equals(user.getId())
                && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to edit this item");
        }
        if (req.getTitle()       != null) item.setTitle(req.getTitle());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getCategory()    != null) item.setCategory(req.getCategory());
        if (req.getStatus()      != null) item.setStatus(req.getStatus());
        if (req.getLocation()    != null) item.setLocation(req.getLocation());
        if (req.getDateStr()     != null) item.setDateStr(req.getDateStr());
        if (req.getImage()       != null) item.setImage(req.getImage());
        if (req.getPinX()        != null) item.setPinX(req.getPinX());
        if (req.getPinY()        != null) item.setPinY(req.getPinY());
        return toDto(itemRepository.save(item), user.getId());
    }

    // ── DELETE ────────────────────────────────────────────────────────────
    @Transactional
    public void deleteItem(Long id, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (!item.getUser().getId().equals(user.getId())
                && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this item");
        }
        itemRepository.delete(item);
    }

    // ── BASIC MATCHING ALGORITHM ──────────────────────────────────────────
    // When item is Lost → find Found items; when Found → find Lost items
    public List<ItemDto> findMatches(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        String oppositeStatus = item.getStatus().equals("Lost") ? "Found" : "Lost";
        Long userId = resolveUserId(userEmail);
        return itemRepository.findPotentialMatches(
                        oppositeStatus, itemId,
                        item.getCategory(), item.getLocation())
                .stream()
                .map(m -> toDto(m, userId))
                .limit(5)
                .toList();
    }

    // ── ADMIN: get all ────────────────────────────────────────────────────
    public List<ItemDto> getAllItemsAdmin() {
        return itemRepository.findAll()
                .stream().map(i -> toDto(i, null)).toList();
    }

    // ── MAPPING ───────────────────────────────────────────────────────────
    private Long resolveUserId(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).map(User::getId).orElse(null);
    }

    public ItemDto toDto(Item item, Long currentUserId) {
        boolean bk = currentUserId != null
                && bookmarkRepository.existsByUserIdAndItemId(currentUserId, item.getId());
        return ItemDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .status(item.getStatus())
                .location(item.getLocation())
                .dateStr(item.getDateStr())
                .founder(item.getFounder())
                .image(item.getImage())
                .pinX(item.getPinX())
                .pinY(item.getPinY())
                .createdAt(item.getCreatedAt())
                .postedBy(AuthService.toDto(item.getUser()))
                .bookmarked(bk)
                .build();
    }
}
