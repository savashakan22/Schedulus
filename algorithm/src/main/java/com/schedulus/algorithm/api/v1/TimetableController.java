package com.schedulus.algorithm.api.v1;

import java.util.UUID;
import java.util.concurrent.ExecutionException;

import com.schedulus.algorithm.constraintsolver.domain.Timetable;
import ai.timefold.solver.core.api.solver.SolverJob;
import ai.timefold.solver.core.api.solver.SolverManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/timetable")
public class TimetableController {

    @Autowired
    private SolverManager<Timetable, UUID> solverManager;

    @PostMapping
    public Timetable solve(@RequestBody Timetable problem) {
        UUID problemId = UUID.randomUUID();
        // Submit the problem to start solving
        SolverJob<Timetable, UUID> solverJob = solverManager.solve(problemId, problem);
        Timetable solution;
        try {
            // Wait until the solving ends
            solution = solverJob.getFinalBestSolution();
        } catch (InterruptedException | ExecutionException e) {
            throw new IllegalStateException("Solving failed.", e);
        }
        return solution;
    }
}