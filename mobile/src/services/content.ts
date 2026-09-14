import { ApiError, apiFetch } from '@/lib/api';
import { API_URL } from '@/lib/config';

export type ContentItem = {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentInput = {
  title: string;
  description: string;
};

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  return new ApiError(
    response.status,
    `Request failed with status ${response.status}`,
    await parseBody(response),
  );
}

export async function listContent(): Promise<ContentItem[]> {
  const response = await apiFetch(`${API_URL}/content`);
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as ContentItem[];
}

export async function getContent(id: number): Promise<ContentItem> {
  const response = await apiFetch(`${API_URL}/content/${id}`);
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as ContentItem;
}

export async function createContent(input: ContentInput): Promise<ContentItem> {
  const response = await apiFetch(`${API_URL}/content`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as ContentItem;
}

export async function updateContent(id: number, input: ContentInput): Promise<ContentItem> {
  const response = await apiFetch(`${API_URL}/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as ContentItem;
}

export async function deleteContent(id: number): Promise<void> {
  const response = await apiFetch(`${API_URL}/content/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
}