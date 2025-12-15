package com.schedulus.algorithm.constraintsolver.domain;

public class Room {

    private String name;
    private int capacity;

    public Room() {
    }

    public Room(String name) {
        this.name = name;
        // Default capacity if not provided
        this.capacity = 10;
    }

    public Room(String name, int capacity) {
        this.name = name;
        this.capacity = capacity;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return name;
    }
}
