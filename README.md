# Contractor Registration Controller Documentation

This documentation explains the functionalities provided by the `RegistrationContractorController.js` file located at:

```
c:\Users\Mahadev\Downloads\DeployNodeJS\controllers\API\ContractorAdminController\RegistrationContractorController.js
```

The controller manages various endpoints related to contractor registration, document uploads, status checking, deletion, detail retrieval, and PDF generation. This documentation is intended to provide both backend and frontend developers with a clear understanding of each function's role and the overall workflow.

---

## Functions and Workflow

### 1. CreateContractorRegistration
- **Purpose:**  
  Creates a new contractor registration or updates an existing one.
  
- **Workflow:**
  - **Validation:**  
    Uses express-validator to check required fields (e.g., `contractor_invitation_id`, `abn_number`, etc.).
  - **Record Check:**  
    - If an `id` is provided, the function retrieves the existing contractor registration.
    - If `new_start` is true or no record exists, a new registration is created.
  - **ABN Uniqueness:**  
    Checks whether the provided `abn_number` already exists. If so, returns a 400 error.
  - **Fallback Values:**  
    For an update scenario using fallback values from the old record.
  - **Response:**  
    Returns a 200 response with either the newly created registration or the updated registration.

- **Frontend Notes:**  
  - Endpoint expects a JSON body (with optional file uploads if required by other endpoints).
  - Use this endpoint to either start a new registration or update existing contractor data.

---

### 2. UploadInsuranceContrator
- **Purpose:**  
  Uploads and updates the insurance document details for a contractor.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id`, `end_date`, and optionally `coverage_amount`.
  - **File Upload:**  
    Expects a file in `req.files.contractor_insurance`. The server changes backslashes in the file path to forward slashes.
  - **Record Creation/Update:**  
    Retrieves any existing insurance record for the contractor; if it exists, the record is updated; otherwise, a new record is created.
  - **Contractor Update:**  
    The contractor registration is updated with the reference to the insurance document and the coverage amount.
  - **Response:**  
    Returns a 200 response with the insurance record details.

- **Frontend Notes:**  
  - Ensure file upload is handled (e.g., using FormData).
  - Display error messages if required parameters are missing.

---

### 3. UploadPublicLiability
- **Purpose:**  
  Uploads and updates the public liability document details.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` and `end_date`.
  - **File Upload:**  
    Expects a file in `req.files.contractor_liability` with proper file path adjustment.
  - **Record Handling:**  
    Checks for an existing public liability record and updates or creates a new one accordingly.
  - **Contractor Reference:**  
    Updates the contractor registration with the public liability document ID.
  - **Response:**  
    Returns a 200 status with the public liability record.

- **Frontend Notes:**  
  - Handle file uploads similarly to the insurance upload.
  - Provide user feedback based on the returned status message.

---

### 4. UploadSafetyMNContractor
- **Purpose:**  
  Uploads safety management documents.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id`.
  - **File Upload:**  
    File is expected under `req.files.safety_contractor_managment`.
  - **Record Handling:**  
    Checks if a safety management record exists for the contractor; updates or creates one accordingly.
  - **Contractor Update:**  
    Updates the contractor registration with a reference to the safety management record.
  - **Response:**  
    Returns a status message indicating successful upload.

- **Frontend Notes:**  
  - Ensure the file is attached as required.
  - Display appropriate messages based on the API response.

---

### 5. GetInsuranceContractor
- **Purpose:**  
  Retrieves contractor document details (insurance, public liability, or safety) based on the `type` query parameter.

- **Workflow:**
  - **Request Parameters:**  
    Expects query parameters: `contractor_id` and `type` (valid values: `insurance`, `public`, or `safety`).
  - **Model Selection:**  
    Depending on `type`, selects the respective model and field name:
    - `insurance`: uses `ContractorRegisterInsurance`
    - `public`: uses `ContractorPublicLiability`
    - `safety`: uses `ContractorOrganizationSafetyManagement`
  - **URL Construction:**  
    After retrieving the record, constructs a full URL using the base URL from environment variables.
  - **Response:**  
    Returns record details, the document path, and the full URL.

- **Frontend Notes:**  
  - Use the `type` parameter to correctly fetch the desired document details.
  - Utilize the `fullUrl` for displaying or linking to the document.

---

### 6. GetPublicLiabilityContractor
- **Purpose:**  
  Retrieves public liability insurance details for a contractor.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` as a query parameter.
  - **Record Retrieval:**  
    Searches for a related public liability record.
  - **Response:**  
    Returns a 200 response with a `fullUrl` calculated from the document path.
  
- **Frontend Notes:**  
  - Though similar to the `GetInsuranceContractor` endpoint, this function specifically fetches public liability details.

---

### 7. GetSafetyMangmentContractor
- **Purpose:**  
  Retrieves safety management details for a contractor.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` as a query parameter.
  - **Record Retrieval:**  
    Finds the safety management record.
  - **Response:**  
    Returns the record with a calculated full URL for the safety document.
  
- **Frontend Notes:**  
  - Use this endpoint when needing to display or validate safety management info.

---

### 8. DeleteInsuranceContrator
- **Purpose:**  
  Deletes a contractor’s document (insurance, public liability, or safety) based on the provided document type.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` and `type` in the POST body.
  - **Document Map:**  
    Uses a mapping to determine which model and contractor reference field to update:
    - `employee_insurance` for insurance documents.
    - `public_liability` for public liability documents.
    - `safety_management` for safety management documents.
  - **Record Deletion:**  
    Finds and destroys the record from the appropriate model.
  - **Contractor Update:**  
    Clears the respective document reference from the contractor registration.
  - **Response:**  
    Returns a confirmation message on successful deletion.

- **Frontend Notes:**  
  - Confirm before deletion as this permanently removes the file record.
  - Handle errors if the provided type does not match the required values.

---

### 9. DeletePublicLContrator
- **Purpose:**  
  Specifically deletes the contractor's public liability document record.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` in the request body.
  - **Record Deletion:**  
    Finds the public liability record and destroys it.
  - **Contractor Reference Update:**  
    Sets the `public_liability_doc_id` to null in the contractor record.
  - **Response:**  
    Returns a confirmation message.

- **Frontend Notes:**  
  - Similar to the insurance deletion, ensure the frontend accurately reflects the removal of data.

---

### 10. DeleteSafetyMContrator
- **Purpose:**  
  Deletes the safety management record for a contractor.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id`.
  - **Record Deletion:**  
    Destroys the safety management record and updates the contractor registration.
  - **Response:**  
    Returns a message confirming deletion.

- **Frontend Notes:**  
  - User confirmation is recommended before triggering deletion.

---

### 11. CheckContractorRegisterStatus
- **Purpose:**  
  Checks and returns the current registration status of a contractor based on the invitation ID.
  
- **Workflow:**
  - **Request Parameters:**  
    Expects `contractor_invitation_id` as a query parameter.
  - **Status Evaluation:**  
    - Retrieves all contractor registration entries linked to the invitation.
    - Evaluates required fields for different “pages” (e.g., contact details, document uploads).
    - Determines `incompletePage` and overall `formStatus` (either `incomplete` or `complete`).
    - Calculates how long ago the record was updated.
  - **Response:**  
    Returns enriched data including form status and the incomplete page indicator.

- **Frontend Notes:**  
  - Use this endpoint to show progress or prompt users to complete missing steps in a multi-page registration form.
  - The `lastUpdatedAgo` field can be used to display recency of the registration data.

---

### 12. DeleteContractorRecords
- **Purpose:**  
  Deletes a contractor registration along with all associated document records.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` in the request body.
  - **Record Deletion:**  
    Sequentially deletes:
      - The insurance record.
      - The public liability record.
      - The safety management record.
      - The main contractor registration record.
  - **Response:**  
    Returns a successful deletion message.

- **Frontend Notes:**  
  - This is a destructive endpoint; ensure the frontend prompts for confirmation before triggering deletion.

---

### 13. GetContractorDetails
- **Purpose:**  
  Retrieves complete contractor registration details along with associated document records.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` as a query parameter.
  - **Data Retrieval:**  
    Retrieves:
      - Contractor registration information.
      - Insurance, public liability, and safety management details.
  - **Data Merge:**  
    Formats certain fields (like dates) and constructs full URLs for the documents.
  - **Page Completion:**  
    Evaluates the data to determine if the registration is `complete` or on which page it is incomplete.
  - **Response:**  
    Returns a merged data object with detailed contractor information.

- **Frontend Notes:**  
  - Use this detailed information to display contractor profiles or review registration data in the UI.
  - Ensure date formatting and URL links are correctly rendered.

---

### 14. MakePdfToAllContractorForm
- **Purpose:**  
  Generates a PDF (or HTML preview) of the complete contractor form details.
  
- **Workflow:**
  - **Request Parameters:**  
    Requires `contractor_id` and optionally `preview_html` in the request body.
  - **Data Aggregation:**  
    Gathers details from contractor registration, insurance, public liability, safety management, organization details, and invitations.
  - **Rendering:**  
    - If `preview_html` is true, renders and sends HTML via an EJS template.
    - Otherwise, calls a PDF generation service to create and return a downloadable PDF file.
  - **Response:**  
    Returns either the rendered HTML or initiates a file download for the PDF.

- **Frontend Notes:**  
  - Use the preview option to allow users to see form details before finalizing or printing.
  - The PDF download can be triggered to provide a snapshot of the contractor form for records.

---

## Final Notes

- **Error Handling:**  
  Each function employs try-catch blocks and returns appropriate error messages (HTTP status 400, 404, or 500) on various failure conditions.
  
- **Consistency:**  
  JSON responses consistently include `success`, `status`, and `message` fields to help the frontend parse and display results.

- **Integration:**  
  For file uploads, ensure your frontend uses multipart/form-data and attaches files with the expected field names (e.g., `contractor_insurance`, `contractor_liability`, `safety_contractor_managment`).

This comprehensive documentation should help both backend and frontend developers understand the complete working flow of each function in the registration controller.

# Contractor Induction Registration Controller Documentation

This controller handles the contractor induction registration process. It involves generating OTPs for email/mobile, verifying the OTPs, completing the contractor registration form, and uploading required documents. Each function in this controller is explained in detail below.

---

## 1. RegitserContractiorInducation

**Purpose:**  
Initiates contractor induction registration by generating an OTP and sending it via email and/or SMS.

**Working Flow:**

- **Input Validation:**  
  The function expects at least a `userEmail` in the request body. Other optional fields include `first_name`, `last_name`, and `mobile_no`.
  
- **OTP Generation:**  
  A secure 6-digit OTP is generated using `generateSecureOTP()`, which creates a random numeric string based on random bytes.

- **Record Check:**  
  It first searches for an existing registration record with the given email:
  - **If the record exists:**  
    - **Mobile Provided:**  
      If a mobile number is provided, the existing record is updated with the mobile number, first name, last name, and a new OTP is set for the mobile along with an expiry time (10 minutes from the time of generation). Then, the OTP is sent via SMS using `sendRegistrationOtpSms()`.
    - **No Mobile Provided:**  
      In this case, the record is updated with a fresh email OTP and its expiry time. The OTP is sent to the provided email address using `sendOtpEmail()`.
  - **If the record does not exist:**  
    - **Duplicate Check for Mobile:**  
      If a mobile number is provided, it checks whether this mobile number is already registered. If it is, an error is returned.
    - **Creating a New Record:**  
      A new registration record is created with the email, OTP, and email OTP expiry. If a mobile number is provided, it is also included along with a mobile OTP and mobile OTP expiry.
    - **Dispatching OTPs:**  
      After creation, the function sends the email OTP and, if applicable, the mobile OTP via SMS.

- **Response:**  
  Returns a success response with a message indicating whether OTPs were sent to "mobile and email" or "email only."

---

## 2. VerifyMobileAndEmail

**Purpose:**  
Verifies the OTP provided by the contractor for email or mobile verification, ensuring that the correct code is entered before registration can be finalized.

**Working Flow:**

- **Input Verification:**  
  The function requires either `userEmail` or `mobile_no` along with the `otpcode` in the request body. If none or the OTP is missing, a 400 error is returned.

- **Record Lookup:**  
  It searches the ContractorInductionRegistration table using either the email or mobile number provided.  
  - If no record is found, a 404 response is returned.

- **OTP Validation:**  
  - **Email Verification:**  
    - Compares the provided OTP (`otpcode`) with the stored `email_otp`.  
    - Checks if the OTP has expired by comparing the current time with `email_otp_expired_at`.  
    - If the OTP is valid and not expired, sets the `email_verified_at` timestamp and clears the OTP fields.
  - **Mobile Verification:**  
    - Similarly, compares the provided OTP with `mobile_otp` and validates against `mobile_verified_expired_at`.  
    - On success, sets the `mobile_otp_verified_at` timestamp and clears mobile OTP values.

- **Response:**  
  Returns a success response with a message stating whether "Email verified successfully" or "Mobile verified successfully". Also returns a subset of the user data (such as id, email, mobile_no, first_name, and last_name).

---

## 3. ContractorRegistrationForm

**Purpose:**  
Finalizes the contractor registration process by updating the induction record with additional details once OTP verification has been completed.

**Working Flow:**

- **Input Requirements:**  
  The function expects a `VerificationId` (the unique record ID for the induction process) and a `password`. It can also accept fields such as `first_name`, `last_name`, `organization_name`, `address`, `trade_Types`, and `invited_by_organization`. Optionally, it handles a file upload for a contractor image.

- **Record Retrieval:**  
  Finds the induction record using the supplied VerificationId. If not found, it returns an error.

- **Verification Checks:**  
  It checks whether the email and/or mobile have been verified by testing if `email_verified_at` and `mobile_otp_verified_at` are set.  
  - If not, returns an error message prompting the user to verify the missing channel(s).

- **Password Hashing:**  
  The provided password is hashed using bcrypt to ensure secure storage.

- **Record Update:**  
  The record is updated with the new information:
  - Personal details (first name, last name).
  - Organization details (organization name, address).
  - Trade types are updated (ensuring proper array formatting).
  - If a file is uploaded, the new contractor image file name is set.
  - The hashed password is stored.
  - The `invited_by_organization` field is updated if provided.

- **Response:**  
  Returns a success message along with the updated record’s key details (omitting sensitive fields like the password).

---

## 4. UploadContractorDocuments

**Purpose:**  
Handles the uploading and updating of various contractor documents required during the induction process.

**Working Flow:**

- **Input Requirements:**  
  The function requires:
  - `VerificationId` to identify the induction record.
  - `reference_number` used as a document reference.
  - Optionally, `issue_date` and `expiry_date` can be provided.

- **Document Type Mapping:**  
  Uses two maps:
  - **docTypeMap:** Maps the expected file input fields (for example, `covid_check_documents`, `flu_vaccination_documents`) to a shorter document type key (e.g., "covid", "flu_vaccination").
  - **idFieldMap:** Associates each document type with the corresponding column in the induction record where the document ID should be stored.

- **Processing Uploaded Files:**  
  Iterates over each key in `docTypeMap`:
  - If a file is uploaded under that key:
    - It retrieves the original file name.
    - Checks if there is an existing ContractorDocument record for that VerificationId and document type.
      - If found, updates it with the new details (reference number, issue/expiry dates, filename).
      - If no record exists, creates a new ContractorDocument record.
    - The updated or created document is stored in an object (`uploadedDocs`) keyed by document type.

- **Updating Induction Record:**  
  For each uploaded document, the matching field (as provided by `idFieldMap`) is updated in the ContractorInductionRegistration record to point to the corresponding document record ID.

- **Response:**  
  Returns a 201 response with a status message and details (in `uploadedDocs`) about the documents that have been successfully uploaded or updated. If no valid document is found in the uploads, a 400 error is returned.

---

*End of InuctionRegisterController Documentation*

This detailed documentation explains the full working flow for each function in the InuctionRegisterController. Both backend developers and frontend teams can refer to these details to understand the contractor induction process—from OTP generation to final registration and document uploads.




# Notification Controller - GetSubmissionPrequalificationNotification

**Purpose:**  
The GetSubmissionPrequalificationNotification function is designed to fetch all contractor registration records that have a submission status of "confirm_submit" and that have not been notified yet (i.e. `notified_prequalification` is false). Once fetched, it emits a real-time socket event to all connected clients with these new submissions so that the frontend can react accordingly (for example, update dashboards or lists). After emitting the notification, the function updates these records to mark them as notified.

---

**Working Flow:**

1. **Query Contractor Registrations:**
   - The function starts by querying the `ContractorRegistration` model to find all registrations that meet these criteria:
     - **Submission Status:** Must be `"confirm_submit"`.
     - **Notification Flag:** Must have `notified_prequalification` set to false.
   - It retrieves selected attributes (e.g., `id`, `contractor_email`, `contractor_name`, `createdAt`, and `abn_number`).

2. **Check for New Submissions:**
   - After the query, the function checks if any new submissions were found.
   - **If No Submissions Found:**
     - It returns a 200 HTTP response with a message stating "No new prequalification submissions found" along with an empty data array.
   
3. **Emit Socket Notification:**
   - If new submissions exist, the function retrieves an instance of the socket connection using the `getIO()` helper.
   - It then emits a socket event named `"new-prequalification"` with the array of new submission records.
   - A console log message ("📡 Emitted new-prequalification to clients") confirms that the notification has been sent to connected clients.

4. **Update Notification Status:**
   - In order to avoid sending duplicate notifications, the function updates the `ContractorRegistration` records:
     - It sets the `notified_prequalification` field to true for all records that were just emitted.
     - This update is performed using a condition that checks for IDs matching the new submissions (using an IN condition with the IDs extracted from the submissions).

5. **Return Response:**
   - Finally, the function returns a 200 HTTP response:
     - The response includes a success flag, a message ("New prequalification submissions notified"), and the data (which is the list of new submissions).
   
6. **Error Handling:**
   - If any error occurs during this process (whether during the query, socket emission, or update operation), the function:
     - Logs the error to the console.
     - Returns a 500 HTTP response with an appropriate error message along with the error details.

---

**Integration & Frontend Considerations:**

- **Real-Time Updates:**  
  The socket emission ensures that any client connected to your application's real-time service gets notified as soon as new prequalification submissions are available.

- **Preventing Duplicate Notifications:**  
  Updating the `notified_prequalification` flag ensures that the same submission is not notified multiple times, maintaining data consistency.

- **Error Handling:**  
  Robust error handling is implemented via try-catch; any failure in the process returns a clear error message for debugging.

- **Socket Usage:**  
  Frontend applications should listen for the `"new-prequalification"` event so that users receive real-time updates (for example, triggering UI alerts or auto-refreshing a list).

By following this detailed workflow, the function ensures that contractor submission notifications are sent out efficiently and only once per new submission.


# User Profile Controller Documentation

This controller handles contractor user profile operations including fetching user details, handling logouts for contractor admins, and sending invitation links to prospective contractors. Below are detailed explanations of each main function in the controller.

---

## 1. GetContractorDetails

**Purpose:**  
Retrieve the complete details of the currently logged-in contractor user.

**Working Flow:**

- **Authentication Check:**  
  The function expects that an authentication middleware has already populated `req.user` with the logged-in user's data.
  
- **User Existence Validation:**  
  - If `req.user` is missing (i.e., the user is not logged in), the function responds with HTTP 401 Unauthorized along with a message.
  
- **Successful Retrieval:**  
  - If the user object is present, it logs the value to the console (for debugging purposes) and then returns an HTTP 200 response with the user data in JSON format.
  
- **Error Handling:**  
  - If an error occurs (for example in retrieving data), the function catches the error, logs it to the console, and returns an HTTP 500 response with an "Internal server error" message.

**Frontend Notes:**  
- This endpoint is used to fetch and display the contractor's profile data on the dashboard or profile page.
- It assumes that a valid session or token is used to set `req.user`.

---

## 2. ContractorAdminLogout

**Purpose:**  
Log out the contractor admin user by invalidating the active refresh token and updating session timestamps.

**Working Flow:**

- **Token Extraction:**  
  - The function first checks for the Authorization header and extracts the JWT token from it.
  - If the token is missing, it returns an HTTP 401 Unauthorized error.
  
- **Token Verification:**  
  - The extracted token is verified using `jwt.verify` along with a secret key (from `process.env.JWT_SECRET`).
  - If verification fails (due to an invalid token or payload), a 401 error is returned.
  
- **User Lookup:**  
  - Upon successful verification, the user's primary key from the token is used to find the corresponding record in the database.
  - If the user is not found, it returns an HTTP 404 error.
  
- **Refresh Token Deletion:**  
  - The function then deletes the refresh token corresponding to the current session from the RefreshToken table.
  
- **Session Update:**  
  - The user's record is updated to mark the logout time (`logout_at`) and clear the login timestamp (`login_at`).
  
- **Response:**  
  - A 200 response is sent back to the client with a suitable success message. It specifies whether the refresh token was successfully deleted or not found (if, for example, it was already removed).
  
- **Error Handling:**  
  - Any error encountered during the process is logged, and an HTTP 500 response is returned.

**Frontend Notes:**  
- On logout, the client should clear session storage or cookies containing authentication tokens.
- This endpoint ensures that the backend also invalidates tokens to prevent misuse.

---

## 3. SendIvitationLinkContractor

**Purpose:**  
Generate and send an invitation link to a contractor’s email, allowing them to register on the platform.

**Working Flow:**

- **Input Extraction:**  
  - The function extracts the `email` and `name` from `req.body`.
  - It also utilizes the logged-in user from `req.user` (i.e., the contractor admin sending the invitation).
  
- **Token Generation and Expiration:**  
  - A secure, unique invitation token is generated using `crypto.randomBytes` (converted to a hex string).
  - The token is set to expire in 72 hours (calculated using the moment library).
  
- **Database Record Creation:**  
  - A new invitation record is created in the `ContractorInvitation` model with details such as:
    - The contractor's email and name.
    - The generated invite token.
    - The ID of the user who sent the invite.
    - Timestamps for when the invitation was sent and when it expires.
    - A default status of `"pending"`.
  
- **Invitation URL Construction:**  
  - An invitation URL is built by combining the frontend URL (from `process.env.FRONTEND_URL`) with a query parameter containing the token.
  
- **Email Content Preparation and Dispatch:**  
  - A styled HTML email is built which explains the invitation, including a clickable button linking to the invitation URL.
  - This email job is then added to the email job queue (using `emailQueue.add`), which allows for asynchronous email sending.
  
- **Response:**  
  - Once the email job is queued, a 200 HTTP response with a message ("Invitation sent successfully!") is returned to the client.
  
- **Error Handling:**  
  - If any error occurs during the process (for example, database error or queue issue), it is caught, logged, and an HTTP 500 response is returned with an "Internal Server Error" message.

**Frontend Notes:**  
- The invitation link sent in the email allows contractors to proceed to a registration screen.
- Ensure that the email address provided by the admin is valid and that proper feedback is given based on the response message.

---

*End of UserProfileController Documentation*

This documentation details the full working flow of each function in the UserProfileController, helping both backend and frontend teams understand how user details, logout, and invitation processes are handled.



# Enquiry Controller Documentation

This controller manages enquiries submitted through the platform. It includes functions for submitting an enquiry, retrieving all enquiries with filtering options, fetching details for a particular enquiry (including activity logs), and updating an enquiry's status with corresponding activity logging and email notifications.

---

## 1. Validation Rules

**Purpose:**  
Defines validation rules for enquiry submission using express-validator.

**Details:**  
- Validates enquiry contact information:
  - `firstName`: Must not be empty.
  - `lastName`: Must not be empty.
  - `email`: Must be in a valid email format and normalized.
  - `mobileNumber`: Required and must follow a valid phone number format.
  - `businessName`: Optional and should be a string.
- Enforces that the enquiry core information (`subject`) is provided.

**Frontend Notes:**  
- These validations help ensure data integrity before proceeding to create the enquiry in the database.

---

## 2. SubmitEnquiry

**Purpose:**  
Submits a new enquiry by capturing contact and core enquiry details.

**Working Flow:**

1. **Validation Execution:**  
   - Uses the defined validation rules and runs them against incoming request data.
   - If any validations fail, responds immediately with a 400 status and details of the errors.

2. **Data Extraction and Creation:**  
   - Destructures fields such as `firstName`, `lastName`, `businessName`, `email`, `mobileNumber`, and `subject` from the request body.
   - Creates a new enquiry record in the `Enquiry` model using these values.

3. **Response:**  
   - On successful creation, sends a 201 HTTP response with a success message and the created enquiry data.
   - If an error occurs during creation, catches the exception, logs the error, and returns a 500 response with an appropriate error message.

**Frontend Notes:**  
- The frontend should display validation errors if present, and on success, confirm that the enquiry was submitted.

---

## 3. formatDate (Helper Function)

**Purpose:**  
Formats a JavaScript Date object into a string with a specific format ("DD-MM-YYYY HH:MM AM/PM").

**Working Flow:**

- Converts a given date into day, month, year, hour, and minute components.
- Adjusts the hour into a 12‑hour format, appending AM or PM appropriately.
- Returns the formatted date string.

**Frontend Notes:**  
- This helper ensures that date values displayed by the UI are human‑readable and consistent.

---

## 4. GetAllEnquiry

**Purpose:**  
Retrieves all enquiries from the database with optional filtering and ordering.

**Working Flow:**

1. **Extract Query Parameters:**  
   - Reads optional query parameters: `status`, `submittedDate`, `userName`, `priority`, and `search`.
   
2. **Build Filtering Conditions:**  
   - Constructs filtering conditions based on the provided values:
     - Filters by enquiry status if provided.
     - Uses an OR condition on names and business name if `userName` is part of the query.
     - Supports a global search on `subject`, `firstName`, `lastName`, or `businessName`.
     - Filters by priority if specified.

3. **Ordering:**  
   - Defaults to sorting by `createdAt` descending (latest first); reverses the order if `submittedDate` is specified as "oldest".

4. **Data Retrieval and Formatting:**  
   - Fetches enquiries matching the conditions from the `Enquiry` table.
   - Maps over each enquiry to format the `createdAt` and `updatedAt` timestamps using the `formatDate` helper.

5. **Response:**  
   - Returns a 200 response with a success message and the formatted data.
   - In case of error, logs and responds with a 500 error.

**Frontend Notes:**  
- Utilize query parameters for filtering (e.g., search by name, subject) and ordering the list.

---

## 5. GetEnquiryById

**Purpose:**  
Fetches detailed information about a specific enquiry, including its activity logs.

**Working Flow:**

1. **Extract Enquiry ID:**  
   - Reads the enquiry ID from request parameters.

2. **Enquiry Retrieval:**  
   - Attempts to find the enquiry record from the `Enquiry` model based on the provided ID.
   - If not found, returns a 404 error.

3. **Activity Log Retrieval:**  
   - Queries the `ActivityLog` model for all logs related to the enquiry.
   - Orders the logs in descending order by timestamp.

4. **Date Formatting:**  
   - Formats the `createdAt` and `updatedAt` timestamps of the enquiry using a local date format (specific to "Australia/Sydney" timezone).

5. **Response Construction:**  
   - Constructs an object containing enquiry details and the associated, formatted activity logs.
   - Returns a 200 response with the enquiry details.
   - If an error occurs during retrieval, logs the error and responds with a 500 error.

**Frontend Notes:**  
- Use this endpoint to display a full view of an enquiry along with its history of changes by sub-admins.

---

## 6. UpdateInquiry

**Purpose:**  
Updates the status (and optionally comments) of an enquiry, logs the update action, and sends an email notification if the enquiry is resolved.

**Working Flow:**

1. **Validation:**  
   - Applies express-validator rules (`validateStatusUpdate`) to the request to ensure `status` is provided and is one of the allowed values (New, In Progress, Resolved, Closed).
   - Validates optional `comments` and ensures they do not exceed 1000 characters.
   - Returns a 400 error if validation fails.

2. **User Verification:**  
   - Verifies that there is a current authenticated user (sub admin) performing the update. Returns an error if unauthorized.

3. **Enquiry Existence Check:**  
   - Attempts to find the enquiry by ID.  
   - If the enquiry is not found or if the status remains unchanged, returns a 400 error with a relevant message.

4. **Updating Status:**  
   - Performs an update on the `Enquiry` record to change its status to the new value.
   - If no rows are affected (update fails), responds with an error message.

5. **Email Notification (If Resolved):**  
   - If the new status is "Resolved", adds an email job to the email queue to notify the enquiry submitter that their enquiry has been resolved.
   - The email includes dynamic content such as the enquiry subject, any admin comments, and a support message.

6. **Logging Activity:**  
   - Creates an entry in the `ActivityLog` model, capturing the action taken (status update), the sub admin performing the action, and any comments provided.
   
7. **Fetching Updated Data:**  
   - Retrieves the updated enquiry record and its activity logs.
   - Formats the created and updated dates to a user-friendly string using the local timezone formatting.

8. **Response:**  
   - Returns a 200 response including a success message and the updated enquiry details along with formatted activity logs.
   - If any error happens during the process, catches it, logs the error, and responds with a 500 error.

**Frontend Notes:**  
- The update enquiry functionality should trigger UI updates upon successful status change.
- The email notification aspect should be monitored to ensure end-users receive timely updates.
- Activity logs provide context for status changes and can be used in an admin dashboard.

---

*End of Enquiry Controller Documentation*

This detailed documentation provides a step-by-step explanation of each function, ensuring clarity about the working flow, logic, and error handling in the enquiryController. Both backend and frontend teams can refer to these details for integration and debugging purposes.



# Organization Admin Controller Documentation

This controller is used by organization administrators to manage various tasks such as retrieving organization details, handling admin logout, sending contractor invitation links, managing invitation records, and updating contractor submission statuses. Below is a detailed explanation of each function in this controller.

---

## 1. GetOrginazationDetails

**Purpose:**  
Retrieve the current organization admin’s details based on the authenticated user.

**Working Flow:**

- The function reads the `req.user` object (populated by authentication middleware).
- If the user is missing (i.e. not logged in), it returns a 401 Unauthorized response.
- Otherwise, it responds with a 200 status and the user data in JSON format.
- Error handling: Catches errors, logs them, and returns a 500 status with an error message.

**Frontend Notes:**  
Use this endpoint to show the organization admin’s profile data on the dashboard.

---

## 2. OrginazationAdminLogout

**Purpose:**  
Log out the organization admin user by deleting their refresh token and updating their session timestamps.

**Working Flow:**

- **Token Extraction & Verification:**
  - Extracts the JWT from the `Authorization` header.
  - Validates the token using `jwt.verify`. If verification fails (e.g. token missing or invalid), returns a 401 response.
- **User Retrieval:**
  - Uses the decoded token’s id to locate the admin user in the database.
- **Refresh Token Deletion & Session Update:**
  - Deletes the refresh token corresponding to the admin user.
  - Updates the admin record to set `logout_at` to the current date and clear `login_at`.
- **Response:**
  - Sends a 200 response indicating whether the refresh token was found and deleted.
- **Error Handling:**
  - Logs errors and returns a 500 response if something goes wrong.

**Frontend Notes:**  
Ensure that the frontend clears any stored tokens and session data upon successful logout.

---

## 3. SendIvitationLinkContractor

**Purpose:**  
Send an invitation link to a contractor’s email address so they can register.

**Working Flow:**

- **Input Processing:**
  - Extracts the contractor’s email and an optional `isResend` flag from `req.body`.
  - Uses the authenticated user from `req.user` to get the inviter’s details.
- **Token & Expiration Generation:**
  - Generates a secure invitation token using `crypto.randomBytes` (converted to hex).
  - Sets an expiration for the token (72 hours from the current time).
- **Organization Check:**
  - Looks up the organization associated with the admin (using `user.id`).
  - Returns a 404 error if the organization is not found.
- **Invitation Record Handling:**
  - Searches for an existing invitation for the contractor email.
    - If found and the invitation’s status is already “accepted”, returns an error.
    - If it’s found and `isResend` is false, returns an error stating the email has been invited.
    - If `isResend` is true, updates the record to revoke the previous invitation, then generates and sends a new invitation.
  - If no existing invitation is found, creates a new invitation record with status “pending”.
- **Invitation URL & Email Dispatch:**
  - Constructs an invitation URL using the frontend URL (from environment variables) and the token.
  - Calls a helper function (`generateInviteHTML`) to create the HTML email content.
  - Adds an email job to `emailQueue` to send the invitation asynchronously.
- **Response:**
  - Returns a 200 response with a success message indicating that the invitation was sent (or resent).
- **Error Handling:**
  - Logs and catches errors and returns a 500 response if problems occur.

**Frontend Notes:**  
Display a confirmation message and ensure the contractor’s email is valid before sending the invitation.

---

## 4. GetInviationLinksList

**Purpose:**  
Retrieve a list of all contractor invitations sent by the current organization admin.

**Working Flow:**

- Uses the authenticated user’s id to filter invitations (from `ContractorInvitation` table) where `invited_by` matches the admin.
- For each invitation, attempts to find a corresponding contractor registration (with submission status "confirm_submit") to attach additional registration info.
- Returns a 200 response with the enriched invitation list.
- If no invitations or errors are found, handles accordingly with error messages/status codes.

**Frontend Notes:**  
Use this endpoint to display sent invitations along with the contractor registration status, if available.

---

## 5. ResendInvitationEmail

**Purpose:**  
Resend an invitation email by revoking the previous invitation and creating a new one.

**Working Flow:**

- **Invitation Lookup:**
  - Retrieves an existing invitation record using the provided invitation id (`id` in `req.body`).
  - Returns a 404 error if the invitation is not found.
- **Revoking & Regeneration:**
  - Updates the existing invitation’s status to "revoked."
  - Generates a new invitation token and calculates a new expiration time (72 hours ahead).
  - Creates a new invitation record with the new token and status set to "pending."
- **Organization & Inviter Lookup:**
  - Finds the organization based on the `invited_by` field.
  - Retrieves the user who sent the invitation.
- **Email Content Construction & Dispatch:**
  - Builds an invitation URL and corresponding HTML email content.
  - Queues an email job using `emailQueue` to resend the invitation email.
- **Response:**  
  - Returns a 200 response with a message indicating successful resending.
- **Error Handling:**  
  - Catches errors, logs them, and returns a 500 response if needed.

**Frontend Notes:**  
This endpoint allows admins to resend an invitation if a contractor did not receive or act on the initial invitation.

---

## 6. handleContractorTokenInvitation

**Purpose:**  
Validate an invitation token provided by a contractor and update the invitation record’s status.

**Working Flow:**

- **Token Verification:**
  - Extracts the token from query parameters.
  - Returns a 400 error if the token is missing.
- **Invitation Lookup:**
  - Finds an invitation record matching the provided token.
  - Returns a 404 error if no invitation is found.
- **Expiration & Status Check:**
  - Compares the current time with the invitation’s expiry time.
  - If the invitation has expired, updates its status to "expired" and returns a 410 response.
  - If already accepted, returns a message indicating so.
- **Status Update:**
  - If the token is valid and not expired, updates the invitation’s status to "accepted."
- **Response:**
  - Responds with a 200 message indicating that the invitation was accepted.
- **Error Handling:**
  - Catches and logs errors, returning a 500 response with error details.

**Frontend Notes:**  
When contractors click the invitation link, they should be directed here to validate the token and proceed with registration.

---

## 7. SendverificationCode

**Purpose:**  
Generate and send an 8-digit OTP (One Time Password) to a contractor’s email for verification purposes.

**Working Flow:**

- **OTP Generation:**
  - Generates an 8-digit OTP and sets an expiry 30 minutes in the future.
- **Invitation Record Handling:**
  - Checks if an invitation exists for the contractor email.
  - If no record exists or `new_form` is indicated in the request, creates a new invitation record with the OTP.
  - Otherwise, updates the existing invitation’s OTP and expiry.
- **Email Dispatch:**
  - Prepares the email content (both plain text and HTML) including the OTP details.
  - Adds an email job to the `emailQueue` to send the OTP email.
- **Response:**
  - Returns a 200 response with a success message indicating that the OTP was sent.
- **Error Handling:**  
  - If errors occur (e.g., database issues, queue errors), logs the error and returns a 500 response.

**Frontend Notes:**  
OTP should be entered by the contractor on the verification form. The frontend must handle scenarios where the OTP expires and another needs to be requested.

---

## 8. VerifyMultifactorAuth

**Purpose:**  
Verify the OTP submitted by the contractor to complete multifactor authentication.

**Working Flow:**

- **Input Extraction:**
  - Receives the contractor’s email and OTP from the request body.
- **Invitation Lookup & Expiry Check:**
  - Finds the latest invitation for the contractor email.
  - Validates whether the OTP is still valid by comparing with the expiry time.
- **OTP Comparison:**
  - Compares the submitted OTP with the one stored in the invitation.
  - If invalid or expired, returns an error response.
- **Update Upon Success:**
  - On successful verification, clears the OTP and its expiry from the invitation.
  - Constructs an object (`contractorRegistration`) containing fields required for proceeding with registration.
- **Token & URL Construction:**
  - Builds a contractor URL using the frontend URL and the stored invitation token.
- **Response:**
  - Returns a 200 response indicating OTP verification success, along with registration details and the URL.
- **Error Handling:**  
  - Errors are caught, logged, and a 500 response is returned if needed.

**Frontend Notes:**  
On successful verification, the contractor is redirected to a registration page using the provided URL.

---

## 9. GetDetailsInvitationDetails

**Purpose:**  
Retrieve detailed information about a contractor’s invitation as well as associated registration and document details.

**Working Flow:**

- **Input Extraction:**
  - Reads `req_id` (the contractor registration id) from query parameters.
- **Data Retrieval:**
  - Fetches the contractor registration record.
  - Retrieves the associated organization and the inviting user.
  - Looks up related invitation, insurance, public liability, and safety management documents.
- **Data Formatting:**
  - Constructs full URLs for document access using the backend URL.
  - Parses staff details and comments history (using JSON parsing with fallbacks).
  - Computes expiration and renewal status based on the registration date.
  - Ensures that undefined fields are replaced with `null`.
- **Response:**
  - Returns a 200 response with a comprehensive JSON object containing all details.
- **Error Handling:**
  - If errors occur during retrieval or formatting, logs the errors and returns a 500 response.

**Frontend Notes:**  
This endpoint is used to present a full profile view of the contractor’s registration details within the admin interface.

---

## 10. UpdateContractorComments

**Purpose:**  
Append new comments to a contractor registration’s comment history.

**Working Flow:**

- **Input Extraction:**
  - Receives `req_id` (registration id) and a new comment from the request body.
- **Comment History Parsing:**
  - Checks existing comments (which might be stored as an array or as a JSON string) and parses them properly.
- **Comment Construction:**
  - Creates a new comment object with a unique id, current timestamp (formatted using moment-timezone), the commenter’s id and name, and the comment content.
- **Update Record:**
  - Appends the new comment to the existing comment history and updates the contractor registration.
- **Response:**
  - Returns a 200 response with a success message, and the updated comment history.
- **Error Handling:**  
  - Catches and logs errors and returns a 500 response if necessary.

**Frontend Notes:**  
Used in admin views to add remarks during review or as part of a feedback loop.

---

## 11. UpdateSubmissionStatus

**Purpose:**  
Update a contractor registration’s submission status (and associated comments) and optionally send an email notification regarding the status change.

**Working Flow:**

- **Input Validation:**
  - Receives mandatory fields `req_id` and `submission_status` as well as optional comments and other parameters.
- **Contractor Lookup:**
  - Searches for the contractor registration record using `req_id`.
  - Returns an error if not found.
- **Comments Handling:**
  - Parses existing `comments_history` (if any) into an array.
  - Optionally appends new comments with timestamps and reviewer details.
- **Record Update:**
  - Updates the contractor’s submission status and comments history.
- **Invitation Update (if exists):**
  - Retrieves the associated invitation record.
  - Updates fields such as approval type, inclusion list, and adjusts the minimum hours field.
- **Email Notification:**
  - If the new submission status is "approved" or "rejected" and the invitation has an email, an email job is queued with a formatted HTML email.
- **Response:**
  - Returns a success message with the updated status and comment history.
- **Error Handling:**
  - Catches and logs errors, returning a 500 response in case of failure.

**Frontend Notes:**  
This endpoint allows admins to change registration status and provide feedback; the email alert ensures contractors are informed of any updates.

---

## 12. GetSubmissionPrequalification

**Purpose:**  
Retrieve contractor registration records based on a given filter for submission prequalification.

**Working Flow:**

- **Filter Extraction:**
  - Reads the query parameter `filter` and builds a `whereClause` accordingly.
    - Supports filtering by a boolean status or a specific submission_status string.
- **Data Retrieval:**
  - Queries the `ContractorRegistration` model with the constructed where clause.
  - Includes a sub-query (using a sequelize literal) to retrieve the contractor_email from the invitation record.
- **Response:**
  - Returns a 200 response with the filtered data and a message.
- **Error Handling:**
  - Logs errors and returns a 500 response if any issues occur.

**Frontend Notes:**  
This endpoint supports listing registrations for prequalification review and can be used with filtering features in the admin dashboard.

---

*End of Organization Controller Documentation*

This documentation provides a comprehensive explanation for each function in the OrginazationControllerAdmin.js file, detailing how data flows through each endpoint and how errors are handled. Both backend developers and frontend teams can use this document to gain a full understanding of organizational administration operations.