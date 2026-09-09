package com.example.api.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Extracts realm roles from the Keycloak JWT's realm_access claim and maps
 * them to ROLE_ authorities used by Spring Security's hasRole checks.
 */
public class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

	@Override
	public Collection<GrantedAuthority> convert(Jwt jwt) {
		Object realmAccess = jwt.getClaim("realm_access");
		if (!(realmAccess instanceof Map<?, ?> realmAccessMap)) {
			return List.of();
		}
		Object roles = realmAccessMap.get("roles");
		if (!(roles instanceof Collection<?> roleList)) {
			return List.of();
		}
		return roleList.stream()
				.map(String::valueOf)
				.map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role))
				.toList();
	}
}