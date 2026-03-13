package com.career.backend.service;

import org.springframework.core.io.ByteArrayResource;

public interface CertificateService {

    ByteArrayResource generateCertificate(Long roadmapId);

}