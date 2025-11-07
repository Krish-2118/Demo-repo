# **App Name**: DistrictEye

## Core Features:

- Data Upload and Parsing: Allows users to upload CSV/Excel files containing district-level performance data. The system will parse, validate, and clean the data before storing it in the PostgreSQL database.
- Dashboard Filters: Provides filters to refine data displayed by District, Date Range, and Category (NBW Execution, Conviction Ratio, etc.).
- KPI Metrics: Displays key performance indicators (KPIs) such as NBW Execution Rate, Conviction Ratio, Narcotic Seizure Count, and Missing Persons Traced Count.
- Data Visualization: Presents data through district-wise comparison bar charts and month-wise trend line charts using Recharts or Chart.js.
- Leaderboard Ranking: Scores districts based on calculated performance metrics and displays a leaderboard of the top 5 performers, highlighting the leading district.
- AI Insight Generation: Uses a generateInsight() tool to create readable sentence summaries of data insights. The LLM reasons about which insights to communicate to the user.
- Report Export: Enables users to export dashboard views to PDF and Excel formats for reporting and analysis.

## Style Guidelines:

- Primary color: Deep navy blue (#1A237E) to convey trust and authority, reminiscent of traditional law enforcement.
- Background color: Light gray (#F0F4F8) for a clean, modern admin dashboard appearance.
- Accent color: Muted teal (#4DB6AC) to provide a calm, trustworthy secondary hue for interactive elements.
- Body and headline font: 'Inter', a sans-serif font, to create a clean and easily readable user interface.
- Use crisp, professional icons to represent data categories and actions.
- Implement a navbar with side navigation for easy access to different pages.
- Use rounded-xl, shadow, and padding-lg for card components.
- Add subtle animations for transitions and data updates.