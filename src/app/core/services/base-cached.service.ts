import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { PagedResult } from '../../shared/models/paged-result.model';

/**
 * Base class for services that need caching functionality.
 * REFACTORING: Reduces code duplication across 7+ service files.
 * 
 * Provides:
 * - Automatic caching with shareReplay
 * - Keyed caching support (for filtered queries)
 * - Cache invalidation on mutations
 * - Consistent caching behavior
 */
@Injectable()
export abstract class BaseCachedService<T> {
  protected api = inject(ApiService);
  private cache$?: Observable<PagedResult<T>>;
  private keyedCache$ = new Map<string, Observable<PagedResult<T>>>();

  /**
   * Gets cached or fresh data based on pagination parameters.
   * If no pagination is provided, uses cache. Otherwise, fetches fresh data.
   */
  protected getCached(
    endpoint: string,
    params?: Record<string, any>,
    pageNumber?: number,
    pageSize?: number
  ): Observable<PagedResult<T>> {
    // If pagination is requested, always fetch fresh data
    if (pageNumber || pageSize) {
      return this.api.get<PagedResult<T>>(endpoint, {
        ...params,
        pageNumber,
        pageSize
      });
    }

    // Otherwise, use cache
    if (!this.cache$) {
      this.cache$ = this.api.get<PagedResult<T>>(endpoint, params).pipe(
        catchError((error: HttpErrorResponse) => {
          // Invalidate cache on error (especially 401/403) so it doesn't get replayed
          this.cache$ = undefined;
          // Re-throw error so components can handle it
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }

    return this.cache$;
  }

  /**
   * Gets cached or fresh data with keyed caching support.
   * Useful for services that cache by filter parameters (e.g., zoneId, siteId).
   */
  protected getCachedWithKey(
    endpoint: string,
    cacheKey: string,
    params?: Record<string, any>,
    pageNumber?: number,
    pageSize?: number
  ): Observable<PagedResult<T>> {
    // If pagination is requested, always fetch fresh data
    if (pageNumber || pageSize) {
      return this.api.get<PagedResult<T>>(endpoint, {
        ...params,
        pageNumber,
        pageSize
      });
    }

    // Use keyed cache
    if (!this.keyedCache$.has(cacheKey)) {
      const cached$ = this.api.get<PagedResult<T>>(endpoint, params).pipe(
        catchError((error: HttpErrorResponse) => {
          // Invalidate cache on error (especially 401/403) so it doesn't get replayed
          this.keyedCache$.delete(cacheKey);
          // Re-throw error so components can handle it
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.keyedCache$.set(cacheKey, cached$);
    }

    return this.keyedCache$.get(cacheKey)!;
  }

  /**
   * Gets a single item by ID (not cached, always fresh).
   */
  protected getById(endpoint: string, id: number): Observable<T> {
    return this.api.get<T>(`${endpoint}/${id}`);
  }

  /**
   * Creates a new item and invalidates cache.
   */
  protected create(endpoint: string, request: any): Observable<T> {
    this.invalidateCache();
    return this.api.post<T>(endpoint, request);
  }

  /**
   * Updates an item and invalidates cache.
   */
  protected update(endpoint: string, id: number, request: any): Observable<T> {
    this.invalidateCache();
    return this.api.put<T>(`${endpoint}/${id}`, request);
  }

  /**
   * Deletes an item and invalidates cache.
   */
  protected delete(endpoint: string, id: number): Observable<void> {
    this.invalidateCache();
    return this.api.delete<void>(`${endpoint}/${id}`);
  }

  /**
   * Invalidates the cache, forcing next request to fetch fresh data.
   */
  protected invalidateCache(): void {
    this.cache$ = undefined;
    this.keyedCache$.clear();
  }

  /**
   * Invalidates a specific keyed cache entry.
   */
  protected invalidateKeyedCache(key: string): void {
    this.keyedCache$.delete(key);
  }
}
