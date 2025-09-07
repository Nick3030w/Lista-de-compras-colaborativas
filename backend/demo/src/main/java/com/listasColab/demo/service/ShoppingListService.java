package com.listasColab.demo.service;

import com.listasColab.demo.model.ShoppingList;
import com.listasColab.demo.model.User;
import com.listasColab.demo.repository.ShoppingListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ShoppingListService {

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private UserService userService;

    // Crear una nueva lista
    public ShoppingList createList(ShoppingList shoppingList) {
        return shoppingListRepository.save(shoppingList);
    }

    // Obtener todas las listas de un usuario (como propietario o colaborador)
    public List<ShoppingList> getUserLists(Long userId) {
        return shoppingListRepository.findByOwnerIdOrCollaboratorsId(userId, userId);
    }

    // Obtener una lista específica por ID
    public Optional<ShoppingList> getListById(Long listId) {
        return shoppingListRepository.findById(listId);
    }

    // Actualizar una lista existente
    public ShoppingList updateList(ShoppingList updatedList) {
        // Verificar si la lista existe
        Optional<ShoppingList> existingList = shoppingListRepository.findById(updatedList.getId());

        if (existingList.isPresent()) {
            ShoppingList list = existingList.get();

            // Actualizar campos
            if (updatedList.getName() != null) {
                list.setName(updatedList.getName());
            }

            if (updatedList.getDescription() != null) {
                list.setDescription(updatedList.getDescription());
            }

            if (updatedList.getCollaborators() != null) {
                list.setCollaborators(updatedList.getCollaborators());
            }

            if (updatedList.getItems() != null) {
                list.setItems(updatedList.getItems());
            }

            return shoppingListRepository.save(list);
        } else {
            throw new RuntimeException("Lista no encontrada con ID: " + updatedList.getId());
        }
    }

    // Eliminar una lista
    public void deleteList(Long listId) {
        shoppingListRepository.deleteById(listId);
    }

    // Agregar un colaborador a una lista
    public ShoppingList addCollaborator(Long listId, String collaboratorEmail) {
        Optional<ShoppingList> listOpt = shoppingListRepository.findById(listId);

        if (listOpt.isPresent()) {
            ShoppingList list = listOpt.get();

            // Buscar usuario por email
            Optional<User> userOpt = userService.findByEmail(collaboratorEmail);

            if (userOpt.isPresent()) {
                User collaborator = userOpt.get();

                // Verificar si el usuario ya es colaborador
                if (!list.getCollaborators().contains(collaborator)) {
                    list.getCollaborators().add(collaborator);
                    return shoppingListRepository.save(list);
                } else {
                    throw new RuntimeException("El usuario ya es colaborador de esta lista");
                }
            } else {
                throw new RuntimeException("Usuario no encontrado con email: " + collaboratorEmail);
            }
        } else {
            throw new RuntimeException("Lista no encontrada con ID: " + listId);
        }
    }

    // Remover un colaborador de una lista
    public ShoppingList removeCollaborator(Long listId, Long userId) {
        Optional<ShoppingList> listOpt = shoppingListRepository.findById(listId);

        if (listOpt.isPresent()) {
            ShoppingList list = listOpt.get();

            // Buscar usuario por ID
            Optional<User> userOpt = userService.findById(userId);

            if (userOpt.isPresent()) {
                User collaborator = userOpt.get();

                // Verificar si el usuario es colaborador
                if (list.getCollaborators().contains(collaborator)) {
                    list.getCollaborators().remove(collaborator);
                    return shoppingListRepository.save(list);
                } else {
                    throw new RuntimeException("El usuario no es colaborador de esta lista");
                }
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + userId);
            }
        } else {
            throw new RuntimeException("Lista no encontrada con ID: " + listId);
        }
    }

    // Verificar si un usuario tiene acceso a una lista (es propietario o
    // colaborador)
    public boolean hasAccessToList(Long listId, Long userId) {
        Optional<ShoppingList> listOpt = shoppingListRepository.findById(listId);

        if (listOpt.isPresent()) {
            ShoppingList list = listOpt.get();

            // Verificar si es el propietario
            if (list.getOwner().getId().equals(userId)) {
                return true;
            }

            // Verificar si es colaborador
            return list.getCollaborators().stream()
                    .anyMatch(user -> user.getId().equals(userId));
        }

        return false;
    }
}