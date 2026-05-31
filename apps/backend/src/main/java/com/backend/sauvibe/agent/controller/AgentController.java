package com.backend.sauvibe.agent.controller;

import com.backend.sauvibe.agent.domain.SupportRequest;
import com.backend.sauvibe.agent.manager.AgentManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/agent")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class AgentController {

  private final AgentManager agentManager;

  @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<ServerSentEvent<String>> streamChat(@RequestBody SupportRequest request) {
    return this.agentManager.chat(request.session_id(), request.soru())
      .map(chunk -> ServerSentEvent.<String>builder()
        .event("chunk")
        .data(chunk)
        .build())
      .concatWith(Flux.just(
        ServerSentEvent.<String>builder()
          .event("done")
          .data("[DONE]")
          .build()))
      .onErrorResume(e -> Flux.just(
        ServerSentEvent.<String>builder()
          .event("error")
          .data("Agent API connection error: " + e.getMessage())
          .build()));
  }

  @PostMapping(value = "/ceng/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<ServerSentEvent<String>> cengChat(@RequestBody SupportRequest request) {
    return this.agentManager.cengChat(request.session_id(), request.soru())
      .map(chunk -> ServerSentEvent.<String>builder()
        .event("chunk")
        .data(chunk)
        .build())
      .concatWith(Flux.just(
        ServerSentEvent.<String>builder()
          .event("done")
          .data("[DONE]")
          .build()))
      .onErrorResume(e -> Flux.just(
        ServerSentEvent.<String>builder()
          .event("error")
          .data("Agent API connection error: " + e.getMessage())
          .build()));
  }

  @GetMapping(value = "/sessions", produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<String> listSessions() {
    return this.agentManager.listSessions();
  }

  @GetMapping(value = "/sessions/{sessionId}", produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<String> getSession(@PathVariable String sessionId) {
    return this.agentManager.getSession(sessionId);
  }

  @DeleteMapping("/sessions/{sessionId}")
  public Mono<String> deleteSession(@PathVariable String sessionId) {
    return this.agentManager.deleteSession(sessionId);
  }
}
