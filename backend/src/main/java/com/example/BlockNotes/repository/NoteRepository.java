package com.example.BlockNotes.repository;

import com.example.BlockNotes.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByUserId(String userId);
}