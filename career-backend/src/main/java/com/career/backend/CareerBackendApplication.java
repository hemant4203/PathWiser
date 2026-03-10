package com.career.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.model.Role;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserRepository;



@SpringBootApplication
@EnableScheduling
@EnableCaching
public class CareerBackendApplication {
	
	@Bean
	public CommandLineRunner createAdmin(UserRepository userRepository,
	                                     PasswordEncoder passwordEncoder) {
	    return args -> {

	        String adminUsername = "admin";

	        if (userRepository.findByUsername(adminUsername).isEmpty()) {

	            User admin = new User();
	            admin.setUsername(adminUsername);
	            admin.setPassword(passwordEncoder.encode("admin123"));
	            admin.setRole(Role.ADMIN);

	            userRepository.save(admin);

	            System.out.println("ADMIN USER CREATED");
	        }
	    };
	}


	public static void main(String[] args) {
		SpringApplication.run(CareerBackendApplication.class, args);
	}

}
