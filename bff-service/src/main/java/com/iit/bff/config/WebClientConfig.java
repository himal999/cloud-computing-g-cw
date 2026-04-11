package com.iit.bff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient identityWebClient(@Value("${identity.service.url}") String identityBaseUrl) {
        return WebClient.builder()
                .baseUrl(identityBaseUrl.replaceAll("/$", ""))
                .build();
    }
}
