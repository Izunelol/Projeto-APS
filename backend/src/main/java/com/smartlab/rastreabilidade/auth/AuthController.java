package com.smartlab.rastreabilidade.auth;

import com.smartlab.rastreabilidade.auth.dto.AuthResponse;
import com.smartlab.rastreabilidade.auth.dto.LoginRequest;
import com.smartlab.rastreabilidade.auth.dto.RegisterRequest;
import com.smartlab.rastreabilidade.user.User;
import com.smartlab.rastreabilidade.user.UserService;
import com.smartlab.rastreabilidade.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${smartlab.security.jwt.expiration-minutes}")
    private long expirationMinutes;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authRequest);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);
        return ResponseEntity.ok(buildResponse(token, principal.getUser()));
    }

    private AuthResponse buildResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .expiresInMinutes(expirationMinutes)
                .user(UserResponse.from(user))
                .build();
    }
}
