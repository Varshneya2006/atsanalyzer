import { body, ValidationChain } from "express-validator";

export const createAnalysisValidator: ValidationChain[] = [
  body("jobDescription")
    .trim()
    .isLength({ min: 50, max: 8000 })
    .withMessage("Job description must be between 50 and 8000 characters"),
  body("resumeId").optional().isMongoId().withMessage("Invalid resume ID"),
];
