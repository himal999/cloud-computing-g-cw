package com.iit.bff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${identity.service.url}")
    private String identityBaseUrl;

    @Bean
    public WebClient identityWebClient() {
        return WebClient.builder()
                .baseUrl(identityBaseUrl)
                .build();
    }

}