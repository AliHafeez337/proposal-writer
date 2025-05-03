# Project Proposal Generator  

A web app to create and manage project proposals with timelines, pricing, and deliverables.  

### **How to Run the Project**  

1. **Install Dependencies**  
   - Open a terminal and run:  
     ```bash
     cd client && npm install
     cd ../server && npm install
     ```

2. **Set Up Environment**  
   - In the `server` folder, rename `.env.example` to `.env` and fill in the necessary environment variables.

3. **Start the App**  
   - Run the backend:  
     ```bash
     cd server && npm run dev
     ```
   - Run the frontend (in a new terminal):  
     ```bash
     cd client && npm run dev
     ```
   - Open your browser to: [http://localhost:5173](http://localhost:5173)  

### **Key Features**  
✅ **Create Proposals** – Add job description (in form of txt, pdf, or docx file), and requirements. Generate scope of work and deliverables. Provide feedback and generate full proposal.
✅ **Proposal Editor** – Edit any section of the AI generated proposal.  
✅ **Deliverables & Pricing** – Add deliverables and pricing.  
✅ **Create Milestones** – Add milestones for each timeline.  
✅ **PDF Export** – Save proposals as printable PDFs.  

### **Project Structure**  
| Folder       | Purpose                          |
|--------------|----------------------------------|
| `client/`    | React frontend (user interface)  |
| `server/`    | Node.js/Express backend (API)    |
| `test-data/` | Sample proposals for testing     |

### **Need Help?**  
- **Backend issues?** Check `server/README.md`.  
- **Frontend issues?** Check `client/README.md`.  
- **Test data?** See `test-data/README.md`.  

---
### **Why This Works**  
1. **No jargon** – Simple steps anyone can follow.  
2. **Clear structure** – Explains what each folder does.  
3. **Troubleshooting** – Directs users to specific docs.  

Let me know if you'd like me to simplify any part further!