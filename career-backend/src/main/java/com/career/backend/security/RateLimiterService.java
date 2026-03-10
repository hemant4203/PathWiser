package com.career.backend.security;

import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import org.springframework.stereotype.Service;

import com.career.backend.errors.RateLimitExceededException;

@Service
public class RateLimiterService {

    private static class RequestBucket {
        private final Deque<Long> timestamps = new ConcurrentLinkedDeque<>();
    }

    private final ConcurrentHashMap<String, RequestBucket> buckets =
            new ConcurrentHashMap<>();

    public void validateRequest(String key,
                                int maxRequests,
                                long windowSeconds) {

        long now = Instant.now().toEpochMilli(); // 🔥 millisecond precision
        long windowMillis = windowSeconds * 1000;

        RequestBucket bucket =
                buckets.computeIfAbsent(key, k -> new RequestBucket());

        synchronized (bucket) {

            while (!bucket.timestamps.isEmpty()
                    && bucket.timestamps.peekFirst() <= now - windowMillis) {
                bucket.timestamps.pollFirst();
            }

            if (bucket.timestamps.size() >= maxRequests) {
                throw new RateLimitExceededException(
                        "Too many requests. Please try again later."
                );
            }

            bucket.timestamps.addLast(now);

            // memory hygiene
            if (bucket.timestamps.isEmpty()) {
                buckets.remove(key);
            }
        }
    }
}