package com.backend.sauvibe.agent.manager;

import com.backend.sauvibe.agent.domain.SupportRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Ömer Asaf Balıkçı
 */
@Slf4j
@Service
public class DefaultAgentManager implements AgentManager {

  private final WebClient webClient;

  public DefaultAgentManager(@Value("${app.agent.api-url}") String agentApiUrl) {
    this.webClient = WebClient.builder()
      .baseUrl(agentApiUrl)
      .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
      .build();
  }

  @Override
  public Flux<String> chat(String sessionId, String prompt) {
    return this.webClient.post()
      .uri("/general-chat")
      .contentType(MediaType.APPLICATION_JSON)
      .bodyValue(new SupportRequest(sessionId, prompt))
      .retrieve()
      .bodyToFlux(String.class)
      .doOnError(e -> log.error("Agent API error: {}", e.getMessage()));
  }

  @Override
  public Flux<String> cengChat(String sessionId, String prompt) {
    return this.webClient.post()
      .uri("/chat")
      .contentType(MediaType.APPLICATION_JSON)
      .bodyValue(new SupportRequest(sessionId, prompt))
      .retrieve()
      .bodyToFlux(String.class)
      .doOnError(e -> log.error("Agent API error: {}", e.getMessage()));
  }

  @Override
  public Mono<String> getSession(String sessionId) {
    return this.webClient.get()
      .uri("/sessions/{id}", sessionId)
      .retrieve()
      .bodyToMono(String.class)
      .onErrorReturn("[]");
  }

  @Override
  public Mono<String> deleteSession(String sessionId) {
    return this.webClient.delete()
      .uri("/sessions/{id}", sessionId)
      .retrieve()
      .bodyToMono(String.class)
      .onErrorReturn("ok");
  }

  @Override
  public Mono<String> listSessions() {
    return this.webClient.get()
      .uri("/sessions")
      .retrieve()
      .bodyToMono(String.class)
      .onErrorReturn("[]");
  }
}
