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


