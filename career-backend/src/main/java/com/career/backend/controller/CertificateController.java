package com.career.backend.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.career.backend.service.CertificateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/certificate")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{roadmapId}")
    public ResponseEntity<ByteArrayResource> downloadCertificate(
            @PathVariable Long roadmapId) {

        ByteArrayResource pdf =
                certificateService.generateCertificate(roadmapId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=certificate.pdf")
                .body(pdf);
    }
}