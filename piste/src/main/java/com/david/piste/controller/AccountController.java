package com.david.piste.controller;

import com.david.piste.SpotifyAccessTokenService;
import com.david.piste.model.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("spotify-account")
public class AccountController {

    @Autowired
    SpotifyAccessTokenService spotifyAccessTokenService;

    @GetMapping("{id}/token")
    public AccessToken getAccessToken(@PathVariable String id){
        return new AccessToken(spotifyAccessTokenService.getAccessTokenForAccount(id));
    }

    @GetMapping("/")
    public String test(){
        return "coucou";
    }

}
