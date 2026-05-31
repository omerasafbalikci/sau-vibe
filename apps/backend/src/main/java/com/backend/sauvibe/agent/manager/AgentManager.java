package com.backend.sauvibe.agent.manager;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface AgentManager {

  Flux<String> chat(String sessionId, String prompt);

  Flux<String> cengChat(String sessionId, String prompt);

  Mono<String> getSession(String sessionId);

  Mono<String> deleteSession(String sessionId);

  Mono<String> listSessions();
}
