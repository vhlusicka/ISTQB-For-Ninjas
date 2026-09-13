import "server-only";
import type { StoredQuestion } from "./types";

// Official ISTQB CTFL 2018 Sample Exam A, version 1.7. The importable source
// with full attribution is stored in knowledge database/imported/questions.json.
export const demoQuestions: StoredQuestion[] = [
  {
    id: 1,
    questionText: "Which one of the following answers describes a test condition?",
    requiredSelections: 1,
    explanation: "A test condition is a testable aspect of a component or system identified as a basis for testing.",
    enabled: true,
    answers: [
      { id: 101, answerText: "A distinguishing characteristic of a component or system", correct: false },
      { id: 102, answerText: "A testable aspect of a component or system identified as a basis for testing", correct: true },
      { id: 103, answerText: "The degree to which a software product provides functions which meet stated and implied needs when used under specified conditions", correct: false },
      { id: 104, answerText: "Test cases designed to execute combinations of conditions and actions resulting from them", correct: false }
    ]
  },
  {
    id: 2,
    questionText: "Which of the following statements is a valid objective for testing?",
    requiredSelections: 1,
    explanation: "Validating whether the test object works as users and other stakeholders expect is an objective of testing. Testing cannot prove that every possible defect is found.",
    enabled: true,
    answers: [
      { id: 201, answerText: "The test should start as late as possible so development has enough time to create a good product", correct: false },
      { id: 202, answerText: "To validate whether the test object works as expected by users and other stakeholders", correct: true },
      { id: 203, answerText: "To prove that all possible defects are identified", correct: false },
      { id: 204, answerText: "To prove that any remaining defects will not cause failures", correct: false }
    ]
  },
  {
    id: 3,
    questionText: "Which statement correctly describes the difference between testing and debugging?",
    requiredSelections: 1,
    explanation: "Dynamic testing can expose failures caused by defects. Debugging finds and eliminates the defects that caused those failures.",
    enabled: true,
    answers: [
      { id: 301, answerText: "Testing identifies the source of defects; debugging analyzes defects and proposes prevention activities", correct: false },
      { id: 302, answerText: "Dynamic testing shows failures caused by defects; debugging eliminates the defects that are the source of failures", correct: true },
      { id: 303, answerText: "Testing removes faults; debugging removes defects that cause the faults", correct: false },
      { id: 304, answerText: "Dynamic testing prevents the causes of failures; debugging removes the failures", correct: false }
    ]
  },
  {
    id: 4,
    questionText: "Which statement describes the most common situation for a failure discovered during testing or in production?",
    requiredSelections: 1,
    explanation: "A product crash is an externally observable failure. The other options describe defects that may or may not cause a visible failure.",
    enabled: true,
    answers: [
      { id: 401, answerText: "The product crashed when the user selected an option in a dialog box", correct: true },
      { id: 402, answerText: "The wrong version of a compiled source code file was included in the build", correct: false },
      { id: 403, answerText: "The computation algorithm used the wrong input variables", correct: false },
      { id: 404, answerText: "The developer misinterpreted the requirement for the algorithm", correct: false }
    ]
  },
  {
    id: 5,
    questionText: "An experienced mobile tester repeatedly runs the same automated tests for months and finds fewer defects. Which testing principle was not observed?",
    requiredSelections: 1,
    explanation: "Tests wear out: repeating the same tests eventually stops revealing new defects, so tests and test data need to be reviewed and refreshed.",
    enabled: true,
    answers: [
      { id: 501, answerText: "Testing depends on the environment", correct: false },
      { id: 502, answerText: "Exhaustive testing is not possible", correct: false },
      { id: 503, answerText: "Repeating the same tests will not find new defects", correct: true },
      { id: 504, answerText: "Defects cluster together", correct: false }
    ]
  },
  {
    id: 6,
    questionText: "In what way can testing be part of quality assurance?",
    requiredSelections: 1,
    explanation: "Testing contributes to quality by reducing the risk of inadequate software quality; it cannot ensure complete requirements or measure quality merely by counting test cases.",
    enabled: true,
    answers: [
      { id: 601, answerText: "It ensures that requirements are detailed enough", correct: false },
      { id: 602, answerText: "Testing reduces the risk of poor software quality", correct: true },
      { id: 603, answerText: "It ensures that standards in the organization are followed", correct: false },
      { id: 604, answerText: "It measures software quality by the number of executed test cases", correct: false }
    ]
  },
  {
    id: 7,
    questionText: "Which activity is part of test analysis in the test process?",
    requiredSelections: 1,
    explanation: "Evaluating the test basis for testability is a test analysis activity. Infrastructure belongs to design, suites to implementation, and lessons learned to completion.",
    enabled: true,
    answers: [
      { id: 701, answerText: "Identifying any required infrastructure and tools", correct: false },
      { id: 702, answerText: "Creating test suites from test scripts", correct: false },
      { id: 703, answerText: "Analyzing lessons learned for process improvement", correct: false },
      { id: 704, answerText: "Evaluating the test basis for testability", correct: true }
    ]
  },
  {
    id: 8,
    questionText: "Match these test work products with their descriptions: 1. Test suite, 2. Test case, 3. Test script, 4. Test charter. A. Scripts for a test run, B. Execution instructions, C. Contains expected results, D. Session-based exploratory testing documentation.",
    requiredSelections: 1,
    explanation: "A suite groups scripts for a run (1A), a test case contains expected results (2C), a script contains execution instructions (3B), and a charter documents exploratory testing activities (4D).",
    enabled: true,
    answers: [
      { id: 801, answerText: "1A, 2C, 3B, 4D", correct: true },
      { id: 802, answerText: "1D, 2B, 3A, 4C", correct: false },
      { id: 803, answerText: "1A, 2C, 3D, 4B", correct: false },
      { id: 804, answerText: "1D, 2C, 3B, 4A", correct: false }
    ]
  },
  {
    id: 9,
    questionText: "How can white-box testing be applied during user acceptance testing?",
    requiredSelections: 1,
    explanation: "At acceptance level, white-box coverage can be based on business or work-process flows defined by functional requirements.",
    enabled: true,
    answers: [
      { id: 901, answerText: "To check whether large volumes of data can be transferred between integrated systems", correct: false },
      { id: 902, answerText: "To check whether all code statements and decision paths have been executed", correct: false },
      { id: 903, answerText: "To check whether all work-process flows have been covered", correct: true },
      { id: 904, answerText: "To cover all web-page navigations", correct: false }
    ]
  },
  {
    id: 10,
    questionText: "Which statement comparing component testing and system testing is true?",
    requiredSelections: 1,
    explanation: "Component tests commonly derive from detailed design, code, data models, or component specifications; system tests commonly derive from requirement specifications or use cases.",
    enabled: true,
    answers: [
      { id: 1001, answerText: "Component testing verifies modules while system testing verifies interfaces between components", correct: false },
      { id: 1002, answerText: "Component test cases usually derive from component specifications, designs, or data models, while system test cases usually derive from requirements or use cases", correct: true },
      { id: 1003, answerText: "Component testing focuses only on functional characteristics while system testing covers functional and non-functional characteristics", correct: false },
      { id: 1004, answerText: "Component testing is the testers' responsibility while system testing is typically the users' responsibility", correct: false }
    ]
  }
];
