package com.david.piste;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.exceptions.SpotifyWebApiException;
import se.michaelthelin.spotify.model_objects.credentials.ClientCredentials;
import se.michaelthelin.spotify.requests.authorization.client_credentials.ClientCredentialsRequest;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Service
public class SpotifyAccessTokenService {

    @Autowired
    ApplicationConfiguration applicationConfiguration;

    Cache<String, String> accessTokenCache = Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .maximumSize(0)
            .build(this::loadAccessTokenForAccount);


    public String getAccessTokenForAccount(String account) {
        /*String accessToken = accessTokenCache.getIfPresent(account);
        if(accessToken==null){
            throw new RuntimeException("Technical error when fetching token");
        }
        return accessToken;*/
        return loadAccessTokenForAccount(account);
    }

    private String loadAccessTokenForAccount(String account) {
        try {
            String clientId = applicationConfiguration.getSpotify().getAccounts().get(account).getClientid();
            String clientSecret = applicationConfiguration.getSpotify().getAccounts().get(account).getClientsecret();
            SpotifyApi spotifyApi = new SpotifyApi.Builder()
                    .setClientId(clientId)
                    .setClientSecret(clientSecret)
                    .build();
            ClientCredentialsRequest clientCredentialsRequest = spotifyApi.clientCredentials()
                    .build();
            ClientCredentials clientCredentials = clientCredentialsRequest.execute();
            return clientCredentials.getAccessToken();
        }catch (IOException | SpotifyWebApiException | ParseException e){
            throw new RuntimeException(e);
        }
    }

}
