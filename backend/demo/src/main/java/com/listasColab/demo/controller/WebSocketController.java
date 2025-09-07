package com.listasColab.demo.controller;

import com.listasColab.demo.model.ShoppingList;
import com.listasColab.demo.service.ShoppingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private ShoppingListService shoppingListService;

    @MessageMapping("/list/{listId}/update")
    @SendTo("/topic/list/{listId}")
    public ShoppingList updateList(@DestinationVariable String listId, ShoppingList updatedList) {
        // Convertir listId a Long
        Long id = Long.parseLong(listId);

        // Establecer el ID en la lista actualizada
        updatedList.setId(id);

        // Actualizar la lista en la base de datos
        ShoppingList savedList = shoppingListService.updateList(updatedList);
        return savedList;
    }
}