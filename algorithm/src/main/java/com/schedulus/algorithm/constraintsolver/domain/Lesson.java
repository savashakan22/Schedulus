package com.schedulus.algorithm.constraintsolver.domain;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;

@PlanningEntity
public class Lesson {

    @PlanningId
    private String id;

    private String subject;
    private String teacher;
    private String studentGroup;
    private Integer durationHours;
    
    // ML-provided weights for optimization
    private Double difficultyWeight;    // 0.0 - 1.0, higher = more difficult
    private Double satisfactionScore;   // 0.0 - 1.0, higher = more satisfying
    
    // User-controlled pin (lesson will keep its assigned timeslot/room)
    private boolean pinned;
    
    // Pre-assigned values when pinned
    private Timeslot pinnedTimeslot;
    private Room pinnedRoom;

    @PlanningVariable
    private Timeslot timeslot;
    @PlanningVariable
    private Room room;

    public Lesson() {
    }

    public Lesson(String id, String subject, String teacher, String studentGroup) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.durationHours = 2;
        this.difficultyWeight = 0.5;  // Default medium difficulty
        this.satisfactionScore = 0.5; // Default neutral satisfaction
        this.pinned = false;
    }

    public Lesson(String id, String subject, String teacher, String studentGroup,
                  Double difficultyWeight, Double satisfactionScore, Integer durationHours) {
        this(id, subject, teacher, studentGroup);
        this.difficultyWeight = difficultyWeight;
        this.satisfactionScore = satisfactionScore;
        this.durationHours = durationHours;
    }

    // This constructor is only for tests
    Lesson(String id, String subject, String teacher, String studentGroup, Timeslot timeslot, Room room) {
        this(id, subject, teacher, studentGroup);
        this.timeslot = timeslot;
        this.room = room;
    }

    public String getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public String getTeacher() {
        return teacher;
    }

    public String getStudentGroup() {
        return studentGroup;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public Timeslot getTimeslot() {
        return timeslot;
    }

    public void setTimeslot(Timeslot timeslot) {
        this.timeslot = timeslot;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Double getDifficultyWeight() {
        return difficultyWeight;
    }

    public void setDifficultyWeight(Double difficultyWeight) {
        this.difficultyWeight = difficultyWeight;
    }

    public Double getSatisfactionScore() {
        return satisfactionScore;
    }

    public void setSatisfactionScore(Double satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    public Timeslot getPinnedTimeslot() {
        return pinnedTimeslot;
    }

    public void setPinnedTimeslot(Timeslot pinnedTimeslot) {
        this.pinnedTimeslot = pinnedTimeslot;
    }

    public Room getPinnedRoom() {
        return pinnedRoom;
    }

    public void setPinnedRoom(Room pinnedRoom) {
        this.pinnedRoom = pinnedRoom;
    }

    @Override
    public String toString() {
        return subject + "(" + id + ")";
    }

}
