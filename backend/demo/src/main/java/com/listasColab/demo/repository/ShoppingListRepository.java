package com.listasColab.demo.repository;

import com.listasColab.demo.model.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    // Encontrar listas por ID de propietario
    List<ShoppingList> findByOwnerId(Long ownerId);

    // Encontrar listas donde el usuario es propietario o colaborador
    @Query("SELECT sl FROM ShoppingList sl WHERE sl.owner.id = :userId OR :userId IN (SELECT c.id FROM sl.collaborators c)")
    List<ShoppingList> findByOwnerIdOrCollaboratorsId(@Param("userId") Long ownerId,
            @Param("userId") Long collaboratorId);

    // Encontrar listas por nombre (búsqueda)
    List<ShoppingList> findByNameContainingIgnoreCase(String name);
}
