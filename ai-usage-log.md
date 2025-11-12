# AI Usage Log

This document tracks AI-assisted code generation in the PeerPrep project.

---

## Entry 1: Matching Status Page

**Date/Time:** 2025-10-28 (Estimated)

**File:** `frontend/src/views/matching-status.js`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Fix partner username not loading correctly and improve timeout handling with countdown, add helpful comments"

**Output Summary:**
Improved partner username fetching with retry logic when initial load fails, enhanced timeout handling with countdown timer and auto-redirect, added rotating loading messages for better UX, improved polling cleanup to prevent memory leaks, and added explanatory comments throughout.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Had basic matching status working but partner username sometimes failed to load. Used Copilot to add retry logic and improve timeout handling. Modified the AI suggestions to fit our existing state management and adjusted countdown behavior. Tested edge cases like slow network and session creation delays.

---

## Entry 2: Collaboration Session Page

**Date/Time:** 2025-10-28

**File:** `frontend/src/views/collaboration-session.js`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Implement resizable chat panel and fix WebSocket memory leaks on component unmount, add code comments"

**Output Summary:**
Added mouse-based resize functionality for chat panel with drag handle, fixed WebSocket event listener cleanup to prevent memory leaks, improved partner username fetching reliability, and added explanatory comments for complex logic.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Chat panel was fixed height and WebSocket listeners weren't cleaning up properly. Used Copilot to implement resize functionality and fix cleanup issues. Modified the resize logic to work within our layout constraints and adjusted event listener cleanup. Tested resize behavior and verified no memory leaks on unmount.

---

## Entry 3: Code Execution Service

**Date/Time:** 2025-10-25

**File:** `frontend/src/services/codeExecutionService.js`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Fix infinite loops crashing browser and capture console output for code execution, add comments explaining the logic"

**Output Summary:**
Added 5-second timeout protection using Promise.race pattern to prevent infinite loops, implemented console.log/error capture and restore mechanism, added execution time tracking, and included detailed comments explaining the timeout and capture logic.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Code execution was working but infinite loops would freeze the browser. Used Copilot to add timeout protection and console capture. Modified timeout duration to 5 seconds and adjusted console capture to match our output format. Tested with infinite loops and various console outputs to verify protection works.

---

## Entry 4: Collaboration Service

**Date/Time:** 2025-10-28

**File:** `frontend/src/services/collaborationService.js`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Fix race condition where session ends before partner receives notification, add comments"

**Output Summary:**
Implemented `endSessionAndWait` method with Promise-based confirmation and timeout, improved event listener setup to handle connection states, enhanced error handling for WebSocket failures, and added comments explaining the Promise pattern.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Session end was causing race conditions where one user navigated away before partner got notified. Used Copilot to implement confirmation mechanism with Promise pattern. Modified timeout handling and adjusted to fit our navigation flow. Tested with both users to ensure proper synchronization.

---

## Entry 5: Matching Box Component

**Date/Time:** 2025-10-25

**File:** `frontend/src/components/home/MatchingBox.jsx`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Prevent users from starting new match when they have active session and validate questions exist before matching, add comments"

**Output Summary:**
Added active session detection on mount with rejoin modal, implemented question availability checking before match requests, improved WebSocket event filtering for correct user matching, enhanced error messages, and added explanatory comments for validation logic.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Users could start multiple matches and sometimes got matched with no available questions. Used Copilot to add session detection and availability checking. Modified modal behavior and adjusted validation logic to match our API. Tested scenarios with active sessions and empty question pools.

---

## Entry 6: Socket Service (Backend)

**Date/Time:** 2025-10-25

**File:** `collaboration-service/src/services/socketService.js`

**Tool:** GitHub Copilot

**Prompt/Command:**
"Track which users are currently connected to session and broadcast connection state changes, add comments"

**Output Summary:**
Implemented connection state tracking with in-memory Map, added broadcasting of connected users list to all participants, improved disconnect handling to update state, enhanced session validation, and added comments explaining the connection tracking logic.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Needed to show which users were actively connected vs just in the session. Used Copilot to add connection tracking with Map and broadcasting logic. Modified state structure to include user details and adjusted validation. Tested with users joining/leaving to verify state updates correctly.

---

## Entry 7: 

**Date/Time:** 2025-10-08

**File:** (`questions` collection in MongoDB database)

**Tool:** ChatGPT

**Prompt/Command:**
"Give me example coding questions with different topics and difficulties. Include examples with inputs and outputs.""

**Output Summary:**
Generated multiple example coding questions formatted in JSON for MongoDB insertion. The samples were created to populate the database for testing admin role functionalities such as adding and retrieving questions.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Used AI-generated question templates to seed test data in MongoDB and validate the admin interface workflow for question creation and management. 

---

## Entry 8: Question Controller (Backend)

**Date/Time:** 2025-10-21
**File:** `question-service/src/controllers/questionController.js`  
**Tool:** ChatGPT

**Prompt/Command:**  
"Help me debug qId, as fetching a single question by its questionId field (for internal service call)"  

**Output Summary:**  
Generated controller function to fetch a single question by `questionId`.  
Added type conversion and validation for numeric IDs, handled missing or invalid IDs with clear status codes,  
and improved error message consistency for debugging.  

**Action Taken:**  
- [ ] Accepted as-is  
- [X] Modified  
- [ ] Rejected  

**Author Notes:**  
Used ChatGPT to debug creation of a consistent controller with robust validation and standardised response format for internal service use. Verified that it correctly returns structured responses.

---

## Entry 9: User Attempt Controller (Backend)

**Date/Time:** 2025-11-07
**File:** `user-question-service/src/controllers/userAttemptController.js`
**Tool:** ChatGPT 

**Prompt/Command:**  
"Help to debug user attempts, to ensure successful saving attempts for all session participants"  

**Output Summary:**  
Enhanced `saveAttempt` function for improved debugging and data integrity. Added request validation, detailed console logs for debugging session and question service calls, and consistent JSON responses.  

**Action Taken:**  
- [ ] Accepted as-is  
- [X] Modified  
- [ ] Rejected  

**Author Notes:**  
Used ChatGPT during debugging to streamline error handling, validation, and service communication logic.  
Kept extensive console outputs to trace request flow and ensurerobust creation of user attempt records.

---

## Entry 10: Collaboration Session Page (Frontend)

**Date/Time:** 2025-11-08  
**File:** `frontend/src/pages/collaboration-session.js  
**Tool:** ChatGPT 

**Prompt/Command:**  
"Debug handleSaveCode logic as there is an error saving the attempt results"  

**Output Summary:**  
Enhanced the `handleSaveCode` function for better debugging and result tracking. Added structured payload for API submission to `userAttemptAxios`. Improved logging and defensive error handling to ensure the session always ends gracefully even on API errors.  

**Action Taken:**  
- [ ] Accepted as-is  
- [X] Modified  
- [ ] Rejected  

**Author Notes:**  
Used ChatGPT while debugging attempt-saving workflow to ensure accurate tracking of data. The generated logic was refined to ensure smooth integration with the backend `userAttemptController` and robust error handling when submitting attempts or ending a collaboration session.

---

## Documentation Files (Also AI-Generated)

### Entry 1: Collaboration Service README

**Date/Time:** 2025-11-11

**File:** `collaboration-service/README.md`

**Tool:** ChatGPT

**Prompt/Command:**
"Format the WebSocket events into clean tables showing Client → Server and Server → Client events with descriptions"

**Output Summary:**
Generated markdown tables for WebSocket events documentation, organized into Client → Server events (join-session, code-change, chat-message, cursor-position) and Server → Client events (session-state, user-joined, user-left, code-updated, chat-message, cursor-updated, session-ended, session-ended-confirmed, error). Included payload structures and descriptions for each event.

**Action Taken:**
- [ ] Accepted as-is
- [X] Modified
- [ ] Rejected

**Author Notes:**
Had all the WebSocket events implemented in code but needed clean documentation. Used copilot to format the events into readable tables. Modified the descriptions to match our actual implementation and added notes about specific events like `session-ended-confirmed`. The table structure was kept but content was adjusted to accurately reflect our codebase.

---

## Summary Statistics

**Total Files Flagged:** 10
- Frontend: 6 files
- Backend: 3 files
- Documentation: 1 file

