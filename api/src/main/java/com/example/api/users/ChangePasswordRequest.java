package com.example.api.users;

/**
 * Request body for {@link PasswordController#changePassword}.
 *
 * @param currentPassword the password the caller is currently using
 * @param newPassword     the password to set
 */
public record ChangePasswordRequest(String currentPassword, String newPassword) {
}