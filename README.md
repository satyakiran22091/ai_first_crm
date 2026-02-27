# Nexus AI CRM - AI-First Lead Intelligence

Nexus AI is a modern, high-performance CRM built to transform static lead data into actionable sales intelligence. Leveraging the power of Google's Gemini LLMs, it provides instant lead prioritization and personalized outreach strategies.

![Live App Preview](https://github.com/satyakiran22091/ai_first_crm/raw/main/static/preview.png) *(Note: Add a screenshot to your static folder if you'd like a preview image here)*

## 🚀 Key Features

- **AI-First Insights**: Instantly analyze new leads to determine priority (High/Medium/Low) and recommended next actions.
- **Smart Outreach**: Generates personalized email/message drafts tailored to the specific lead and company profile.
- **Intelligent Caching**: AI analysis results are persisted in a local SQLite database, significantly reducing API latency and token costs on subsequent views.
- **Glassmorphism UI**: A premium, responsive dashboard featuring a modern dark-mode aesthetic with blur effects and smooth animations.
- **Full CRUD API**: Robust FastAPI backend for managing the complete lifecycle of sales leads.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **AI Engine**: Google Gemini API (gemini-flash-latest)
- **Database**: SQLAlchemy + SQLite
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), and JavaScript ES6
- **Deployment**: Render / Railway / Heroku compatible

## 💻 Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/satyakiran22091/ai_first_crm.git
   cd ai_first_crm
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the server**:
   ```bash
   uvicorn app:app --reload
   ```
   Access the dashboard at `http://127.0.0.1:8000`

## 🌐 Deployment

This app is production-ready. 
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Runtime**: Ensure `runtime.txt` specifies `python-3.11.8`.

---
**Live Demo**: [https://ai-first-crm-0hol.onrender.com](https://ai-first-crm-0hol.onrender.com)
