-- =============================================
-- GradFolio Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  major TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  field TEXT NOT NULL,
  major TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  submission_type TEXT NOT NULL CHECK (submission_type IN ('file', 'link', 'text')),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE UNIQUE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.email() = 'admin@gradfolio.com');

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- TASKS POLICIES
CREATE POLICY "Authenticated users can view tasks"
  ON public.tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage tasks"
  ON public.tasks FOR ALL
  USING (auth.email() = 'admin@gradfolio.com');

-- SUBMISSIONS POLICIES
CREATE POLICY "Users can view own submissions; admin can view all"
  ON public.submissions FOR SELECT
  USING (auth.uid() = user_id OR auth.email() = 'admin@gradfolio.com');

CREATE POLICY "Users can insert their own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update submission status"
  ON public.submissions FOR UPDATE
  USING (auth.email() = 'admin@gradfolio.com');

-- REVIEWS POLICIES
CREATE POLICY "Users can view reviews of their own submissions"
  ON public.reviews FOR SELECT
  USING (
    auth.email() = 'admin@gradfolio.com'
    OR EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = reviews.submission_id
        AND submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.email() = 'admin@gradfolio.com');

CREATE POLICY "Admin can update reviews"
  ON public.reviews FOR UPDATE
  USING (auth.email() = 'admin@gradfolio.com');

-- =============================================
-- SUPABASE STORAGE
-- Create bucket: submissions (public)
-- =============================================
-- Run in Supabase Dashboard → Storage → New Bucket
-- Name: submissions
-- Public: true

-- =============================================
-- SEED DATA — Sample Tasks
-- =============================================

INSERT INTO public.tasks (title, description, field, major, skills, submission_type, deadline) VALUES

-- IT / Cybersecurity
(
  'Perform a Basic Network Vulnerability Scan',
  'Using Nmap or a similar tool, scan a provided test environment (localhost or a VM) and identify open ports and potential vulnerabilities. Document your findings in a structured report including: what ports are open, what services are running, and what risks they may pose. Suggest remediation steps for at least two identified issues.',
  'IT', 'Cybersecurity',
  ARRAY['Network Security', 'Nmap', 'Risk Assessment', 'Technical Writing'],
  'file',
  NOW() + INTERVAL '14 days'
),
(
  'Analyze a Phishing Email Sample',
  'You are given three simulated phishing email samples. For each one: identify the social engineering techniques used, extract any suspicious URLs or attachments (do not click them), and write a brief threat analysis. Finally, write a one-page guide on how employees can spot phishing emails.',
  'IT', 'Cybersecurity',
  ARRAY['Threat Analysis', 'Social Engineering', 'Email Security'],
  'text',
  NOW() + INTERVAL '10 days'
),

-- IT / Data Analysis
(
  'Analyze a Sales Dataset and Present Insights',
  'Download the provided CSV sales dataset. Clean the data (handle missing values and duplicates), perform exploratory data analysis, and create at least 3 visualizations using Python (matplotlib/seaborn) or Excel. Write a 1-page summary of your top 3 business insights and recommendations.',
  'IT', 'Data Analysis',
  ARRAY['Python', 'Data Cleaning', 'Visualization', 'EDA'],
  'link',
  NOW() + INTERVAL '12 days'
),
(
  'Build a Dashboard for Monthly KPIs',
  'Using a tool of your choice (Google Looker Studio, Power BI, Tableau Public, or Python Dash), build an interactive dashboard that tracks monthly KPIs from the provided dataset. The dashboard must include: total revenue, top 5 products, regional breakdown, and a month-over-month trend. Share the live link or export a screenshot report.',
  'IT', 'Data Analysis',
  ARRAY['Dashboard Design', 'KPI Analysis', 'Data Visualization'],
  'link',
  NOW() + INTERVAL '18 days'
),

-- IT / Software Development
(
  'Build a REST API for a Task Manager',
  'Build a simple REST API using Node.js (Express) or Python (FastAPI/Flask) that supports CRUD operations for a task manager. Endpoints: GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id. Include input validation, proper HTTP status codes, and a README with setup instructions. Submit your GitHub repository link.',
  'IT', 'Software Development',
  ARRAY['REST API', 'Node.js or Python', 'CRUD', 'Git'],
  'link',
  NOW() + INTERVAL '20 days'
),
(
  'Fix and Improve an Existing React Component',
  'You are given a buggy React component (shared via CodeSandbox link). Your task is: fix all identified bugs, improve the code readability, add basic error handling, and write a short comment explaining what each major change does. Fork the sandbox and submit the link to your improved version.',
  'IT', 'Software Development',
  ARRAY['React', 'JavaScript', 'Debugging', 'Code Quality'],
  'link',
  NOW() + INTERVAL '8 days'
),

-- Business / Marketing
(
  'Create a Social Media Content Plan',
  'For a fictional startup called "EcoSnack" (healthy snacks brand), create a 30-day social media content plan for Instagram. Include: content pillars, 12 post ideas (with captions and hashtag strategy), 2 story ideas per week, and a brief brand voice guide. Submit your plan as a PDF or Google Doc.',
  'Business', 'Marketing',
  ARRAY['Content Strategy', 'Social Media', 'Copywriting', 'Brand Identity'],
  'link',
  NOW() + INTERVAL '10 days'
),
(
  'Write a Product Launch Email Campaign',
  'EcoSnack is launching a new protein bar. Write a 3-email drip campaign: Email 1 (teaser, 1 week before), Email 2 (launch day announcement), Email 3 (follow-up with customer testimonial). Each email should have a compelling subject line, body copy, and clear CTA. Submit as a document.',
  'Business', 'Marketing',
  ARRAY['Email Marketing', 'Copywriting', 'Customer Journey', 'CTA Optimization'],
  'file',
  NOW() + INTERVAL '14 days'
),

-- Business / Finance
(
  'Build a Basic Financial Model for a Startup',
  'Create a 12-month financial projection for a fictional SaaS startup. Include: revenue model (MRR, churn rate), operating expenses breakdown, cash flow statement, and break-even analysis. Use Excel or Google Sheets. Provide key assumptions and a 1-page commentary on financial health.',
  'Business', 'Finance',
  ARRAY['Financial Modeling', 'Excel', 'Cash Flow Analysis', 'SaaS Metrics'],
  'link',
  NOW() + INTERVAL '16 days'
),
(
  'Analyze and Value a Public Company',
  'Pick any publicly listed company. Using publicly available data, calculate: P/E ratio, EV/EBITDA, and perform a simple DCF valuation. Write a 1-page investment thesis: is the stock overvalued, fairly valued, or undervalued? Include your data sources and key assumptions.',
  'Business', 'Finance',
  ARRAY['Valuation', 'DCF Analysis', 'Financial Ratios', 'Investment Analysis'],
  'file',
  NOW() + INTERVAL '12 days'
),

-- Design / Graphic Design
(
  'Design a Brand Identity for a Coffee Shop',
  'Create a complete brand identity for a fictional coffee shop called "Breva". Deliverables: logo (primary + secondary variants), color palette with hex codes, typography selection, and 2 mockup applications (e.g., cup, business card). Submit your Behance link or a PDF portfolio.',
  'Design', 'Graphic Design',
  ARRAY['Logo Design', 'Brand Identity', 'Typography', 'Color Theory'],
  'link',
  NOW() + INTERVAL '21 days'
),
(
  'Redesign a Poster for Maximum Impact',
  'You are given a low-quality event poster. Redesign it to be visually compelling while preserving all the original information. Focus on: hierarchy, whitespace, typography, and color use. Submit before/after images and a 200-word explanation of your design decisions.',
  'Design', 'Graphic Design',
  ARRAY['Layout Design', 'Visual Hierarchy', 'Typography', 'Design Critique'],
  'file',
  NOW() + INTERVAL '10 days'
),

-- Design / UI/UX
(
  'Design a Mobile Onboarding Flow',
  'Design a 4-screen mobile onboarding flow for a fitness tracking app. Create high-fidelity mockups using Figma. The flow should: welcome the user, collect their fitness goal, show a feature highlight, and end with a CTA to get started. Submit your Figma link (view access).',
  'Design', 'UI/UX',
  ARRAY['Figma', 'Mobile Design', 'UX Writing', 'User Onboarding'],
  'link',
  NOW() + INTERVAL '15 days'
),
(
  'Conduct a Usability Audit and Propose Fixes',
  'Choose any well-known app or website (e.g., a government website, local business site). Conduct a heuristic evaluation using Nielsen''s 10 usability heuristics. Identify 5 issues, rate their severity (1–3), and propose a redesign solution for the top 2 issues with annotated wireframes.',
  'Design', 'UI/UX',
  ARRAY['Usability Testing', 'Heuristic Evaluation', 'Wireframing', 'UX Research'],
  'file',
  NOW() + INTERVAL '12 days'
);
