package com.example.api.content;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContentService {

	private static final Logger log = LoggerFactory.getLogger(ContentService.class);

	private final ContentRepository contentRepository;

	private String requireSubject(Jwt jwt) {
		if (jwt == null || jwt.getSubject() == null) {
			throw new RuntimeException("Unauthenticated request: no subject claim in token");
		}
		return jwt.getSubject();
	}

	public ContentDto toDto(Content content) {
		return ContentDto.builder()
				.id(content.getId())
				.title(content.getTitle())
				.description(content.getDescription())
				.createdBy(content.getCreatedBy())
				.createdAt(content.getCreatedAt())
				.updatedAt(content.getUpdatedAt())
				.build();
	}

	public Content toEntity(ContentDto contentDto) {
		return Content.builder()
				.id(contentDto.getId())
				.title(contentDto.getTitle())
				.description(contentDto.getDescription())
				.createdBy(contentDto.getCreatedBy())
				.build();
	}

	public ResponseEntity<?> create(ContentDto contentDto, Jwt jwt) {
		try {
			Content content = toEntity(contentDto);
			content.setCreatedBy(requireSubject(jwt));
			Content saved = contentRepository.save(content);
			return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
		} catch (RuntimeException e) {
			log.error("Error creating content: {}", e.getMessage());
			return ResponseEntity.internalServerError().body("Error creating content: " + e.getMessage());
		}
	}

	public ResponseEntity<?> getAll() {
		try {
			List<ContentDto> contentList = contentRepository.findAll().stream()
					.map(this::toDto)
					.toList();
			return ResponseEntity.ok(contentList);
		} catch (RuntimeException e) {
			log.error("Error fetching content list: {}", e.getMessage());
			return ResponseEntity.internalServerError().body("Error fetching content list: " + e.getMessage());
		}
	}

	public ResponseEntity<?> getById(Long id) {
		try {
			Content content = contentRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Content not found with id: " + id));
			return ResponseEntity.ok(toDto(content));
		} catch (RuntimeException e) {
			log.error("Error fetching content with id {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error fetching content: " + e.getMessage());
		}
	}

	public ResponseEntity<?> update(Long id, ContentDto contentDto) {
		try {
			Content content = contentRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Content not found with id: " + id));
			content.setTitle(contentDto.getTitle());
			content.setDescription(contentDto.getDescription());
			// createdBy stays as originally recorded; it is not client-editable
			Content saved = contentRepository.save(content);
			return ResponseEntity.ok(toDto(saved));
		} catch (RuntimeException e) {
			log.error("Error updating content with id {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error updating content: " + e.getMessage());
		}
	}

	public ResponseEntity<?> delete(Long id) {
		try {
			Content content = contentRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Content not found with id: " + id));
			contentRepository.delete(content);
			return ResponseEntity.ok("Content deleted with id: " + id);
		} catch (RuntimeException e) {
			log.error("Error deleting content with id {}: {}", id, e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error deleting content: " + e.getMessage());
		}
	}
}