package com.schedulus.algorithm.constraintsolver.domain;

public class Room {

    private String name;
    private Integer capacity;

    public Room() {
    }

    public Room(String name) {
        this.name = name;
        this.capacity = 30; // Default capacity
    }

    public Room(String name, Integer capacity) {
        this.name = name;
        this.capacity = capacity;
    }

    public String getName() {
        return name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    @Override
    public String toString() {
        return name;
    }
}

