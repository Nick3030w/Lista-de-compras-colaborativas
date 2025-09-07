package com.listasColab.demo.controller;

import com.listasColab.demo.model.ShoppingList;
import com.listasColab.demo.model.User;
import com.listasColab.demo.security.UserPrincipal;
import com.listasColab.demo.service.ShoppingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/lists")
public class ShoppingListController {

    @Autowired
    private ShoppingListService shoppingListService;

    // Obtener todas las listas del usuario autenticado
    @GetMapping
    public ResponseEntity<List<ShoppingList>> getUserLists(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        List<ShoppingList> lists = shoppingListService.getUserLists(userId);
        return ResponseEntity.ok(lists);
    }

    // Obtener una lista específica por ID
    @GetMapping("/{id}")
    public ResponseEntity<ShoppingList> getList(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        // Verificar acceso
        if (!shoppingListService.hasAccessToList(id, userId)) {
            return ResponseEntity.status(403).build();
        }

        Optional<ShoppingList> list = shoppingListService.getListById(id);

        if (list.isPresent()) {
            return ResponseEntity.ok(list.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Crear una nueva lista
    @PostMapping
    public ResponseEntity<ShoppingList> createList(@Valid @RequestBody ShoppingList shoppingList,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        // Crear usuario propietario (simplificado)
        User owner = new User();
        owner.setId(userId);
        shoppingList.setOwner(owner);

        ShoppingList createdList = shoppingListService.createList(shoppingList);
        return ResponseEntity.ok(createdList);
    }

    // Actualizar una lista existente
    @PutMapping("/{id}")
    public ResponseEntity<ShoppingList> updateList(@PathVariable Long id, @Valid @RequestBody ShoppingList shoppingList,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        // Verificar acceso
        if (!shoppingListService.hasAccessToList(id, userId)) {
            return ResponseEntity.status(403).build();
        }

        shoppingList.setId(id);
        ShoppingList updatedList = shoppingListService.updateList(shoppingList);
        return ResponseEntity.ok(updatedList);
    }

    // Eliminar una lista
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteList(@PathVariable Long id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        // Verificar acceso (solo el propietario puede eliminar)
        Optional<ShoppingList> listOpt = shoppingListService.getListById(id);

        if (listOpt.isPresent() && listOpt.get().getOwner().getId().equals(userId)) {
            shoppingListService.deleteList(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(403).build();
        }
    }

    // Agregar colaborador
    @PostMapping("/{id}/collaborators")
    public ResponseEntity<ShoppingList> addCollaborator(@PathVariable Long id, @RequestBody String email,
            Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        // Verificar acceso
        if (!shoppingListService.hasAccessToList(id, userId)) {
            return ResponseEntity.status(403).build();
        }

        try {
            ShoppingList updatedList = shoppingListService.addCollaborator(id, email);
            return ResponseEntity.ok(updatedList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}