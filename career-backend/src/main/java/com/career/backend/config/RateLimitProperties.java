package com.career.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "security.rate-limit")
public class RateLimitProperties {

    private Limit login;
    private Limit refresh;

    public static class Limit {
        private int maxRequests;
        private long windowSeconds;

        public int getMaxRequests() {
            return maxRequests;
        }

        public void setMaxRequests(int maxRequests) {
            this.maxRequests = maxRequests;
        }

        public long getWindowSeconds() {
            return windowSeconds;
        }

        public void setWindowSeconds(long windowSeconds) {
            this.windowSeconds = windowSeconds;
        }
    }

    public Limit getLogin() {
        return login;
    }

    public void setLogin(Limit login) {
        this.login = login;
    }

    public Limit getRefresh() {
        return refresh;
    }

    public void setRefresh(Limit refresh) {
        this.refresh = refresh;
    }
}