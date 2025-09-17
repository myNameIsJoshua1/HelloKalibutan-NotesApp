package com.example.BlockNotes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BlockNotesApplication {

	public static void main(String[] args) {
		SpringApplication.run(BlockNotesApplication.class, args);
		System.out.println("Backend running at port 8080!");
	}

}
