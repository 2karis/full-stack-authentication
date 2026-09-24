package com.example.api.users;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/me/password")
@RequiredArgsConstructor
public class PasswordController {

	private final PasswordService passwordService;

	@PutMapping
	public ResponseEntity<?> changePassword(
			@AuthenticationPrincipal Jwt jwt,
			@RequestBody ChangePasswordRequest request) {
		if (isBlank(request.currentPassword()) || isBlank(request.newPassword())) {
			return ResponseEntity.badRequest().body("currentPassword and newPassword are required.");
		}
		try {
			passwordService.changePassword(jwt, request.currentPassword(), request.newPassword());
			return ResponseEntity.noContent().build();
		} catch (PasswordService.WrongPasswordException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect.");
		} catch (RestClientResponseException e) {
			return ResponseEntity.internalServerError().body("Could not update the password.");
		}
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}