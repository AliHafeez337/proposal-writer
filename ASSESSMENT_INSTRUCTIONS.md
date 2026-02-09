# Assessment: AI-Powered Proposal Writer Application

## Overview

Build a full-stack web application that helps users create professional project proposals using AI. The application should allow users to upload project documents, use AI to analyze and generate proposal content, edit the generated content, add pricing, create milestones, and export proposals as PDFs.

---

## Technical Requirements

### Backend (Server)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB (using Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for handling file uploads
- **File Processing**: Support PDF, DOCX, and TXT files
- **AI Integration**: OpenAI API (GPT-3.5-turbo or newer)
- **Logging**: Winston for application logging

### Frontend (Client)
- **Framework**: React (latest version)
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router
- **Form Handling**: Formik with Yup validation
- **PDF Generation**: React-PDF (@react-pdf/renderer)
- **HTTP Client**: Axios
- **Date Handling**: Day.js with MUI Date Pickers

---

## Core Features to Implement

### 1. Authentication System
- User registration with email and password
- User login with JWT authentication
- Protected routes (users can only access their own proposals)
- Password hashing using bcryptjs

### 2. Proposal Management
- Create new proposals
- List all user's proposals
- View individual proposals
- Edit proposals
- Delete proposals
- Proposal status tracking: `draft` → `initial_analysis` → `reviewing` → `generated` → `complete`

### 3. Multi-Step Proposal Creation Workflow

#### Step 1: Basic Information
- Proposal title (required)
- Proposal description (optional)
- Save and proceed to next step

#### Step 2: Document Upload & Analysis
- Upload multiple files (PDF, DOCX, TXT)
- View uploaded files with ability to delete
- Enter user requirements (text field)
- Trigger AI analysis:
  - Extract text from uploaded files
  - Analyze documents and requirements
  - Generate scope of work (bullet points)
  - Generate deliverables list with:
    - Item name
    - Unit (e.g., "pages", "hours", "items")
    - Count (number)
    - Description
- Display generated scope and deliverables
- Allow user to provide feedback and regenerate

#### Step 3: Generate Full Proposal
- Generate complete proposal using AI:
  - Executive Summary (1 paragraph)
  - Key Requirements (technical/business requirements as array)
  - Work Breakdown Structure (tasks with durations in days)
  - Timeline (phases with start/end dates)
- Display all generated content
- Allow editing of any section:
  - Executive Summary (editable text field)
  - Scope of Work (editable text field)
  - Requirements (add/edit/delete items)
  - Deliverables (edit item, unit, count, description)
  - Work Breakdown (edit tasks, durations, dependencies)
  - Timeline (edit phases, dates, tasks)
- Add pricing for deliverables:
  - For each deliverable, set unit price
  - Auto-calculate total price (unit price × count)
  - Update total when pricing changes
- Create milestones for timeline phases:
  - Milestone name
  - Percentage of total (must sum to ≤ 100%)
  - Due date (must be within phase date range)
  - Auto-calculate payment amount based on percentage

#### Step 4: Review & Export
- View complete proposal with all sections
- Edit any section inline
- Export proposal as PDF with professional formatting

### 4. Proposal Data Model

Each proposal should contain:

```javascript
{
  title: String (required),
  description: String,
  user: ObjectId (reference to User),
  status: String (enum: 'draft', 'initial_analysis', 'reviewing', 'generated', 'complete'),
  files: [{
    originalName: String,
    storageName: String,
    path: String,
    size: Number,
    fileType: String,
    uploadDate: Date
  }],
  userRequirements: String,
  userFeedback: String,
  content: {
    executiveSummary: String,
    scopeOfWork: String,
    requirements: [String],
    deliverables: [{
      item: String,
      unit: String,
      count: Number (min: 1, integer),
      description: String
    }],
    workBreakdown: [{
      task: String,
      duration: Number (days, min: 1, integer),
      dependencies: [String]
    }],
    timeline: [{
      phase: String,
      startDate: Date,
      endDate: Date,
      tasks: [String],
      milestones: [{
        name: String,
        percentage: Number (1-100),
        dueDate: Date (within phase date range),
        paymentAmount: Number (auto-calculated)
      }]
    }]
  },
  pricing: {
    items: [{
      deliverableId: ObjectId (reference to content.deliverables),
      unitPrice: Number (min: 0.01),
      notes: String (optional)
    }],
    total: Number (auto-calculated)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/protected` - Test protected route

#### Proposals
- `GET /api/proposals` - Get all user's proposals
- `POST /api/proposals` - Create new proposal
- `GET /api/proposals/:id` - Get single proposal
- `PATCH /api/proposals/:id/title` - Update title/description
- `POST /api/proposals/:id/files` - Upload files (multipart/form-data)
- `DELETE /api/proposals/:id/files/:fileId` - Delete file
- `PATCH /api/proposals/:id/section/:section` - Update proposal section
- `DELETE /api/proposals/:id` - Delete proposal

#### AI Processing
- `POST /api/ai/:id/process` - Initial analysis (generate scope & deliverables)
- `POST /api/ai/:id/analyze` - Re-analyze with feedback
- `POST /api/ai/:id/generate` - Generate full proposal

#### Pricing
- `POST /api/pricing/:id/items` - Update deliverable prices and generate milestones

### 6. File Processing
- Extract text from PDF files (use `pdf-parse`)
- Extract text from DOCX files (use `mammoth`)
- Extract text from TXT files (read directly)
- Store uploaded files in `server/uploads/` directory
- Clean up files when proposal is deleted

### 7. AI Integration

#### Initial Analysis (`analyzeScopeAndDeliverables`)
- Input: Document text + user requirements
- Output: JSON with `scopeOfWork` (string) and `deliverables` (array)
- Model: GPT-3.5-turbo with JSON response format

#### Re-analysis with Feedback (`analyzeScopeAndDeliverablesWithFeedback`)
- Input: Current scope, deliverables, requirements, feedback
- Output: Updated scope and deliverables

#### Full Proposal Generation (`generateFullProposal`)
- Input: Scope, deliverables, requirements, feedback
- Output: JSON with:
  - `executiveSummary` (string)
  - `requirements` (array of strings)
  - `workBreakdown` (array with task, duration in days, dependencies)
  - `timeline` (array with phase, start date, end date)

### 8. Frontend Components Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── PageLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Proposals/
│   │   ├── Create/
│   │   │   ├── BasicInfo.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Generate.jsx
│   │   │   └── Review.jsx
│   │   ├── Edit/
│   │   │   ├── EditableText.jsx
│   │   │   ├── EditableRequirements.jsx
│   │   │   ├── EditableDeliverablesWithPricing.jsx
│   │   │   ├── EditableWorkPlan.jsx
│   │   │   └── EditableTimeline.jsx
│   │   ├── View/
│   │   │   ├── Requirements.jsx
│   │   │   ├── Deliverables.jsx
│   │   │   ├── ProposalWorkPlan.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── PaymentSchedule.jsx
│   │   │   └── Scope.jsx
│   │   ├── PDF/
│   │   │   ├── ProposalPDF.jsx
│   │   │   └── PDFDownloadButton.jsx
│   │   ├── ProposalCard.jsx
│   │   └── ProposalView.jsx
│   └── common/
│       └── EditableTextField.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard.jsx
│   └── Proposals/
│       ├── List.jsx
│       └── Create.jsx
├── services/
│   ├── api.js (axios instance)
│   ├── auth.js
│   ├── proposals.js
│   ├── ai.js
│   └── pricing.js
├── contexts/
│   └── AuthContext.jsx
└── styles/
    └── theme.js
```

### 9. UI/UX Requirements
- Use Material-UI components for consistent design
- Implement a stepper component for the multi-step workflow
- Show loading states during AI processing
- Display error messages clearly
- Make all proposal content editable inline
- Responsive design (works on desktop and tablet)
- Professional PDF export formatting

### 10. Validation & Error Handling
- Validate proposal title is required
- Validate milestone percentages don't exceed 100%
- Validate milestone due dates are within phase date range
- Validate deliverable counts are positive integers
- Validate pricing unit prices are positive numbers
- Handle file upload errors (size limits, invalid types)
- Handle AI API errors gracefully
- Show user-friendly error messages

---

## Implementation Steps

### Phase 1: Setup & Authentication
1. Initialize backend project with Express
2. Set up MongoDB connection
3. Create User model with email and hashed password
4. Implement JWT authentication (register, login)
5. Create authentication middleware
6. Initialize frontend React project with Vite
7. Set up routing and protected routes
8. Create login and register pages

### Phase 2: Basic Proposal CRUD
1. Create Proposal model with all required fields
2. Implement proposal CRUD endpoints
3. Create proposal list page
4. Create proposal creation page (basic info step)
5. Implement proposal viewing page

### Phase 3: File Upload & Processing
1. Set up Multer for file uploads
2. Create file upload endpoint
3. Implement file text extraction (PDF, DOCX, TXT)
4. Create file upload UI component
5. Display uploaded files with delete functionality

### Phase 4: AI Integration
1. Set up OpenAI API client
2. Implement initial analysis function
3. Implement re-analysis with feedback function
4. Implement full proposal generation function
5. Create AI processing endpoints
6. Create UI for triggering AI analysis
7. Display generated content

### Phase 5: Editing & Refinement
1. Create editable components for each proposal section
2. Implement section update endpoints
3. Add inline editing functionality
4. Implement feedback and regeneration flow

### Phase 6: Pricing & Milestones
1. Create pricing update endpoint
2. Implement milestone creation logic
3. Create pricing UI component
4. Create milestone management UI
5. Auto-calculate totals and payment amounts

### Phase 7: PDF Export
1. Set up React-PDF
2. Create PDF template component
3. Format all proposal sections for PDF
4. Add PDF download button

### Phase 8: Polish & Testing
1. Add error handling throughout
2. Add loading states
3. Validate all inputs
4. Test complete workflow
5. Clean up code and add comments

---

## Environment Variables

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/proposal-writer
JWT_SECRET=your-secret-key-here
PORT=5000
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

---

## Acceptance Criteria

The application is considered complete when:

✅ Users can register and login  
✅ Users can create, view, edit, and delete proposals  
✅ Users can upload PDF, DOCX, and TXT files  
✅ AI successfully analyzes documents and generates scope & deliverables  
✅ Users can provide feedback and regenerate content  
✅ AI generates complete proposals with all required sections  
✅ Users can edit all proposal sections inline  
✅ Users can add pricing to deliverables  
✅ Users can create milestones with payment schedules  
✅ Users can export proposals as formatted PDFs  
✅ All validations work correctly  
✅ Error handling is implemented throughout  
✅ UI is responsive and user-friendly  

---

## Testing Data

You can use sample project documents for testing:
- Job descriptions in TXT format
- Requirements documents
- Sample PDFs with project information

---

## Deliverables

1. Complete source code (client and server)
2. README.md with setup instructions
3. `.env.example` file with required environment variables
4. Working application that can be run locally
5. Code should be well-organized and commented

---

## Bonus Features (Optional)

- Proposal templates
- Email proposal sharing
- Proposal versioning/history
- Team collaboration features
- Advanced PDF customization
- Dark mode UI
- Proposal analytics

---

## Notes

- Focus on code quality and maintainability
- Use consistent naming conventions
- Add appropriate error handling
- Comment complex logic
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper security (password hashing, JWT validation)
- Clean up uploaded files when proposals are deleted

---

## Questions?

If you have any questions about the requirements, please ask for clarification before starting implementation.

Good luck! 🚀

