package com.career.backend.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserRoadmap;
import com.career.backend.errors.ResourceNotFoundException;
import com.career.backend.model.RoadmapStatus;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserRepository;
import com.career.backend.repository.UserRoadmapRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRoadmapRepository userRoadmapRepository;

    private User getCurrentUser() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalStateException("User not found"));
    }

    @Override
    public ByteArrayResource generateCertificate(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository
                .findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        UserRoadmap userRoadmap = userRoadmapRepository
                .findByUserAndRoadmap(user, roadmap)
                .orElseThrow(() ->
                        new IllegalStateException("Roadmap not started"));

        if (userRoadmap.getStatus() != RoadmapStatus.CERTIFIED) {
            throw new IllegalStateException("Certificate not available");
        }

        try {

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            Document document = new Document();
            PdfWriter.getInstance(document, out);

            document.open();

            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD);
            Font textFont = new Font(Font.HELVETICA, 16);

            document.add(new Paragraph("Certificate of Completion", titleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("This certifies that", textFont));
            document.add(new Paragraph(user.getUsername(), titleFont));
            document.add(new Paragraph("has successfully completed the roadmap", textFont));
            document.add(new Paragraph(roadmap.getTitle(), titleFont));

            String date = userRoadmap.getCompletedAt()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

            document.add(new Paragraph("Date: " + date, textFont));

            document.close();

            return new ByteArrayResource(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate");
        }
    }
}