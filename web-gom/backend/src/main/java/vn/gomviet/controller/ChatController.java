package vn.gomviet.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.gomviet.dto.ChatDtos;
import vn.gomviet.service.GeminiChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final GeminiChatService service;

    public ChatController(GeminiChatService service) {
        this.service = service;
    }

    @PostMapping
    public ChatDtos.Response chat(@Valid @RequestBody ChatDtos.Request request) {
        return service.chat(request);
    }

    @GetMapping("/history/{sessionToken}")
    public ChatDtos.HistoryResponse getHistory(@PathVariable String sessionToken) {
        return service.getHistory(sessionToken);
    }

    @DeleteMapping("/history/{sessionToken}")
    public ResponseEntity<Void> clearHistory(@PathVariable String sessionToken) {
        service.deleteSession(sessionToken);
        return ResponseEntity.noContent().build();
    }
}
