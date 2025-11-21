package com.example.BlockNotes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
public class BlockNotesApplication {

    @CrossOrigin(origins = {"http://localhost:3000/", "http://localhost:5173"})
	public static void main(String[] args) {
		SpringApplication.run(BlockNotesApplication.class, args);
		System.out.println("Backend running at port 8080!");
	}

}
