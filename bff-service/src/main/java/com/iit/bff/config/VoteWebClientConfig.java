package com.iit.bff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class VoteWebClientConfig {

    @Bean
    public WebClient voteWebClient(@Value("${vote.service.url}") String voteBaseUrl) {
        return WebClient.builder()
                .baseUrl(voteBaseUrl.replaceAll("/$", ""))
                .build();
    }
}
