package com.schedulus.algorithm.constraintsolver.solver;

import com.schedulus.algorithm.constraintsolver.domain.Lesson;
import com.schedulus.algorithm.constraintsolver.domain.Room;
import com.schedulus.algorithm.constraintsolver.domain.Timeslot;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;

import java.time.Duration;
import java.time.LocalTime;

public class TimetableConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[] {
                // Hard constraints
                roomConflict(constraintFactory),
                teacherConflict(constraintFactory),
                studentGroupConflict(constraintFactory),
                durationFitsTimeslot(constraintFactory),
                pinnedLessonTimeslot(constraintFactory),
                pinnedLessonRoom(constraintFactory),
                
                // Soft constraints
                morningPreferenceForDifficultCourses(constraintFactory),
                satisfactionMaximization(constraintFactory),
                teacherConsecutiveLessons(constraintFactory),
                timeslotPreference(constraintFactory),
                compactDayScheduling(constraintFactory),
        };
    }

    // ========== HARD CONSTRAINTS ==========

    /**
     * A room can accommodate at most one lesson at the same time.
     */
    Constraint roomConflict(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class, Joiners.equal(Lesson::getRoom))
                .filter((lesson1, lesson2) -> overlaps(lesson1.getTimeslot(), lesson2.getTimeslot()))
                .penalize(HardSoftScore.ONE_HARD, (l1, l2) -> 1)
                .asConstraint("Room conflict");
    }

    /**
     * A teacher can teach at most one lesson at the same time.
     */
    Constraint teacherConflict(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class, Joiners.equal(Lesson::getTeacher))
                .filter((lesson1, lesson2) -> overlaps(lesson1.getTimeslot(), lesson2.getTimeslot()))
                .penalize(HardSoftScore.ONE_HARD, (l1, l2) -> 1)
                .asConstraint("Teacher conflict");
    }

    /**
     * A student group can attend at most one lesson at the same time.
     */
    Constraint studentGroupConflict(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class, Joiners.equal(Lesson::getStudentGroup))
                .filter((lesson1, lesson2) -> overlaps(lesson1.getTimeslot(), lesson2.getTimeslot()))
                .penalize(HardSoftScore.ONE_HARD, (l1, l2) -> 1)
                .asConstraint("Student group conflict");
    }

    /**
     * Lesson must fit in the assigned timeslot duration.
     */
    Constraint durationFitsTimeslot(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getTimeslot() != null && lesson.getDurationHours() != null)
                .filter(lesson -> {
                    long durationMinutes = lesson.getDurationHours() * 60L;
                    return lesson.getTimeslot().durationMinutes() < durationMinutes;
                })
                .penalize(HardSoftScore.ofHard(50))
                .asConstraint("Lesson duration fits timeslot");
    }

    /**
     * Pinned lessons must stay in their pinned timeslot.
     */
    Constraint pinnedLessonTimeslot(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.isPinned() && lesson.getPinnedTimeslot() != null)
                .filter(lesson -> !lesson.getTimeslot().equals(lesson.getPinnedTimeslot()))
                .penalize(HardSoftScore.ofHard(100)) // Very high penalty
                .asConstraint("Pinned lesson timeslot");
    }

    /**
     * Pinned lessons must stay in their pinned room.
     */
    Constraint pinnedLessonRoom(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.isPinned() && lesson.getPinnedRoom() != null)
                .filter(lesson -> !lesson.getRoom().equals(lesson.getPinnedRoom()))
                .penalize(HardSoftScore.ofHard(100)) // Very high penalty
                .asConstraint("Pinned lesson room");
    }

    // ========== SOFT CONSTRAINTS ==========

    /**
     * Difficult courses (high difficulty weight) should be scheduled in morning slots
     * when students are more alert.
     */
    Constraint morningPreferenceForDifficultCourses(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getDifficultyWeight() != null && lesson.getDifficultyWeight() >= 0.7)
                .filter(lesson -> lesson.getTimeslot() != null && !lesson.getTimeslot().isMorning())
                .penalize(HardSoftScore.ONE_SOFT,
                        lesson -> (int) (lesson.getDifficultyWeight() * 10))
                .asConstraint("Morning preference for difficult courses");
    }

    /**
     * Maximize overall satisfaction by rewarding high-satisfaction courses
     * being placed in preferred timeslots.
     */
    Constraint satisfactionMaximization(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getSatisfactionScore() != null && lesson.getTimeslot() != null)
                .filter(lesson -> lesson.getTimeslot().getPreferenceBonus() != null)
                .reward(HardSoftScore.ONE_SOFT,
                        lesson -> (int) (lesson.getSatisfactionScore() * 
                                        lesson.getTimeslot().getPreferenceBonus() * 10))
                .asConstraint("Satisfaction maximization");
    }

    /**
     * Penalize teachers having consecutive lessons without a break.
     * Teachers should have some rest between classes.
     */
    Constraint teacherConsecutiveLessons(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(Lesson::getTeacher),
                        Joiners.equal(lesson -> lesson.getTimeslot().getDayOfWeek()))
                .filter((lesson1, lesson2) -> areConsecutive(lesson1.getTimeslot(), lesson2.getTimeslot()))
                .penalize(HardSoftScore.ofSoft(2))
                .asConstraint("Teacher consecutive lessons");
    }

    /**
     * General timeslot preference bonus.
     */
    Constraint timeslotPreference(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getTimeslot() != null && 
                                 lesson.getTimeslot().getPreferenceBonus() != null)
                .reward(HardSoftScore.ONE_SOFT,
                        lesson -> (int) (lesson.getTimeslot().getPreferenceBonus() * 5))
                .asConstraint("Timeslot preference");
    }

    /**
     * Encourage filling a single day before spreading lessons thinly across many days.
     * This rewards lessons that are on the same day, especially when they help fill
     * longer continuous periods.
     */
    Constraint compactDayScheduling(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(lesson -> lesson.getTimeslot() != null ? lesson.getTimeslot().getDayOfWeek() : null))
                .filter((lesson1, lesson2) -> lesson1.getTimeslot() != null && lesson2.getTimeslot() != null)
                .reward(HardSoftScore.ofSoft(1), (lesson1, lesson2) -> {
                    long gap = Math.abs(java.time.Duration.between(
                            lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime()).toMinutes());
                    return gap <= 120 ? 3 : 1; // higher reward when they are closer (same half-day)
                })
                .asConstraint("Compact day scheduling");
    }

    // ========== HELPER METHODS ==========

    private boolean areConsecutive(Timeslot ts1, Timeslot ts2) {
        if (ts1 == null || ts2 == null) {
            return false;
        }
        // Check if the end time of one is equal to the start time of the other
        LocalTime end1 = ts1.getEndTime();
        LocalTime start2 = ts2.getStartTime();
        LocalTime end2 = ts2.getEndTime();
        LocalTime start1 = ts1.getStartTime();
        
        // Allow 15-minute gap as "consecutive"
        Duration gap1 = Duration.between(end1, start2);
        Duration gap2 = Duration.between(end2, start1);
        
        return (gap1.toMinutes() >= 0 && gap1.toMinutes() <= 15) ||
               (gap2.toMinutes() >= 0 && gap2.toMinutes() <= 15);
    }

    private boolean overlaps(Timeslot ts1, Timeslot ts2) {
        return ts1 != null && ts2 != null && ts1.getDayOfWeek().equals(ts2.getDayOfWeek()) && ts1.overlaps(ts2);
    }

}
