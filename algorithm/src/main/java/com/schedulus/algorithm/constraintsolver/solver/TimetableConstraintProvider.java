package com.schedulus.algorithm.constraintsolver.solver;

import com.schedulus.algorithm.constraintsolver.domain.Lesson;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;

public class TimetableConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[] {
                // Hard constraints
                roomConflict(constraintFactory),
                teacherConflict(constraintFactory),
                studentGroupConflict(constraintFactory),
                // Soft constraints
                maximizeSatisfaction(constraintFactory),
                roomFit(constraintFactory)
        };
    }

    Constraint roomConflict(ConstraintFactory constraintFactory) {
        // A room can accommodate at most one lesson at the same time.
        return constraintFactory
                // Select each pair of 2 different lessons ...
                .forEachUniquePair(Lesson.class,
                        // ... in the same timeslot ...
                        Joiners.equal(Lesson::getTimeslot),
                        // ... in the same room ...
                        Joiners.equal(Lesson::getRoom))
                // ... and penalize each pair with a hard weight.
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room conflict");
    }

    Constraint teacherConflict(ConstraintFactory constraintFactory) {
        // A teacher can teach at most one lesson at the same time.
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(Lesson::getTimeslot),
                        Joiners.equal(Lesson::getTeacher))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Teacher conflict");
    }

    Constraint studentGroupConflict(ConstraintFactory constraintFactory) {
        // A student can attend at most one lesson at the same time.
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(Lesson::getTimeslot),
                        Joiners.equal(Lesson::getStudentGroup))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Student group conflict");
    }

    Constraint maximizeSatisfaction(ConstraintFactory constraintFactory) {
        // Maximize Satisfaction: If a lesson is assigned to a Timeslot, add Timeslot.satisfactionScore to the total score.
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getTimeslot() != null)
                .reward(HardSoftScore.ONE_SOFT,
                        lesson -> lesson.getTimeslot().getSatisfactionScore())
                .asConstraint("Maximize satisfaction");
    }

    Constraint roomFit(ConstraintFactory constraintFactory) {
        // Room Fit: Ensure highly popular courses (high difficultyWeight) get larger rooms.
        return constraintFactory
                .forEach(Lesson.class)
                .filter(lesson -> lesson.getRoom() != null)
                .reward(HardSoftScore.ONE_SOFT,
                        // Reward: (Lesson Weight * Room Capacity) / Scaling Factor
                        // Logic: High weight lesson in large room = Big reward.
                        // Ideally we want to Penalize small rooms for high weight, but reward works too.
                        // Let's keep it simple: if Room Capacity >= Difficulty Weight * factor, reward.
                        // Or just maximize capacity usage.
                        lesson -> lesson.getDifficultyWeight() * lesson.getRoom().getCapacity())
                .asConstraint("Room fit");
    }

}