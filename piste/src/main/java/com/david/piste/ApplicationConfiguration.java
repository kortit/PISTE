package com.david.piste;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;

@ConfigurationProperties("piste")
@Data
public class ApplicationConfiguration {

    @Data
    public static class Spotify{
        @Data
        public static class Account{
            private String clientid;
            private String clientsecret;
        }

        private Map<String, Account> accounts;
    }

    private Spotify spotify;

    private String test;
}
