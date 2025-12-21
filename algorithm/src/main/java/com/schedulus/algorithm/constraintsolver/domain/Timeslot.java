package com.schedulus.algorithm.constraintsolver.domain;

import java.time.DayOfWeek;
import java.time.LocalTime;

public class Timeslot {

    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double preferenceBonus;  // Higher = more preferred (e.g., mornings)

    public Timeslot() {
    }

    public Timeslot(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.preferenceBonus = calculateDefaultPreference(startTime);
    }

    public Timeslot(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, Double preferenceBonus) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.preferenceBonus = preferenceBonus;
    }

    private Double calculateDefaultPreference(LocalTime startTime) {
        // Morning slots (8-12) get higher preference
        int hour = startTime.getHour();
        if (hour >= 8 && hour < 12) {
            return 1.0;
        } else if (hour >= 12 && hour < 14) {
            return 0.7; // Lunch time - moderate preference
        } else {
            return 0.5; // Afternoon - lower preference
        }
    }

    public boolean isMorning() {
        return startTime.getHour() < 12;
    }

    public boolean isAfternoon() {
        return startTime.getHour() >= 14;
    }

    public long durationMinutes() {
        return java.time.Duration.between(startTime, endTime).toMinutes();
    }

    public boolean overlaps(Timeslot other) {
        if (other == null || !dayOfWeek.equals(other.getDayOfWeek())) {
            return false;
        }
        return !(endTime.isBefore(other.getStartTime()) || endTime.equals(other.getStartTime())
                || other.getEndTime().isBefore(startTime) || other.getEndTime().equals(startTime));
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public Double getPreferenceBonus() {
        return preferenceBonus;
    }

    public void setPreferenceBonus(Double preferenceBonus) {
        this.preferenceBonus = preferenceBonus;
    }

    @Override
    public String toString() {
        return dayOfWeek + " " + startTime;
    }

}
