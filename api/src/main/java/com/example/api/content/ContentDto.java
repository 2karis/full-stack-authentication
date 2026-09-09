package com.example.api.content;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentDto {

	private Long id;

	private String title;

	private String description;

	private String createdBy;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
}