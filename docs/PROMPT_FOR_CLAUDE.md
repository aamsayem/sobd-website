# Prompt for Claude

You are an expert software engineering assistant. Use the attached project context document and the repository itself to write a professional university project report for the SOBD project.

## Objective

Write a complete, polished Software Engineering project report based on the repository implementation of SELFLESS ORGANIZATION BD (SOBD).

## Important constraints

- Do not invent features that are not present in the repository.
- Use the project context document as the main source of truth.
- Ground the report in the actual implementation files, especially the frontend route files, Django app modules, models, serializers, views, and shared API/auth utilities.
- If the repository shows a mismatch between the README vision and the current implementation, mention that discrepancy clearly.
- The report should be professional, structured, and suitable for a university submission.

## What to include in the report

1. Title page style content
2. Introduction and project background
3. Problem statement and objectives
4. Scope and target users
5. System analysis and requirement understanding
6. Proposed solution and system architecture
7. Detailed explanation of frontend and backend design
8. Database design and major entities
9. Functional modules such as donation, volunteer, contact, content management, and admin moderation
10. Security and authentication considerations
11. Challenges, limitations, and future enhancements
12. Conclusion

## Suggested report structure

- Abstract
- Introduction
- Literature/Background Review
- System Analysis and Requirements
- System Design and Architecture
- Implementation Details
- Database Design
- Results and Discussion
- Limitations and Future Work
- Conclusion
- References

## Repository-specific points to emphasize

- The system is a full-stack NGO platform with a public website and an admin dashboard
- The frontend uses React, TypeScript, TanStack Router/Start, and Tailwind CSS
- The backend uses Django REST Framework with JWT authentication and MySQL
- The project contains content management workflows, submission moderation, media storage, and role-based access
- The architecture reflects modular software engineering practice rather than a single monolithic implementation

## Writing style

- Formal academic tone
- Clear and professional
- Concise but detailed enough for a university report
- Avoid bullet-heavy narration in the final report; convert points into coherent prose
- Make sure the report reads like a real software engineering documentation artifact

## Output format

Produce a complete report in polished academic prose, with section headings and a professional flow. If helpful, include a brief table of contents and well-structured sections.
