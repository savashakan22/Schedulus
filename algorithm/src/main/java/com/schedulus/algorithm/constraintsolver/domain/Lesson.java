package com.schedulus.algorithm.constraintsolver.domain;

import java.util.Comparator;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;

@PlanningEntity(difficultyComparatorClass = Lesson.DifficultyComparator.class)
public class Lesson {

    @PlanningId
    private String id;

    private String subject;
    private String teacher;
    private String studentGroup;
    private int difficultyWeight;

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
    }

    public Lesson(String id, String subject, String teacher, String studentGroup, int difficultyWeight) {
        this(id, subject, teacher, studentGroup);
        this.difficultyWeight = difficultyWeight;
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

    public int getDifficultyWeight() {
        return difficultyWeight;
    }

    public void setDifficultyWeight(int difficultyWeight) {
        this.difficultyWeight = difficultyWeight;
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

    @Override
    public String toString() {
        return subject + "(" + id + ")";
    }

    public static class DifficultyComparator implements Comparator<Lesson> {
        @Override
        public int compare(Lesson a, Lesson b) {
            return Comparator.comparingInt(Lesson::getDifficultyWeight)
                    .thenComparing(Lesson::getId)
                    .compare(a, b);
        }
    }
}