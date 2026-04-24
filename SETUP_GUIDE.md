# UMD Health Assistant - Setup Guide

This project is a health assistant chatbot for University of Maryland students, powered by Claude AI. It helps students find campus health resources, including mental health services, medical care, wellness programs, and more.

## What We've Set Up

✅ Cloned the Anthropic Claude Quickstarts repository
✅ Stripped out AWS Bedrock complexity (no AWS credentials needed!)
✅ Created mock UMD health resources database
✅ Configured basic chat interface
✅ Added health-specific categories and system prompt

## Project Structure

```
.
├── app/
│   ├── api/chat/          # Chat API endpoint (Claude integration)
│   ├── lib/
│   │   ├── health_resources.json      # UMD health resources database
│   │   ├── health_categories.json     # Health category definitions
│   │   └── utils.ts                   # Mock RAG retrieval (no AWS needed)
│   └── page.tsx           # Main page
├── components/
│   ├── ChatArea.tsx       # Main chat interface
│   ├── LeftSidebar.tsx    # Left sidebar (optional)
│   └── RightSidebar.tsx   # Right sidebar (optional)
├── .env.local             # Environment variables (ADD YOUR API KEY HERE!)
└── package.json           # Dependencies
```

## Quick Start (Your First 30 Minutes)

### Step 1: Install Dependencies (5 mins)

```bash
npm install
```

### Step 2: Add Your API Key (2 mins)

1. Get your Anthropic API key from https://console.anthropic.com/dashboard
2. Open `.env.local` file
3. Replace `your_anthropic_api_key_here` with your actual API key:

```
ANTHROPIC_API_KEY=sk-ant-...your-key-here
```

### Step 3: Run the Development Server (1 min)

```bash
# Run with both sidebars
npm run dev

# Or run chat-only (no sidebars)
npm run dev:chat
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### Step 4: Test the Chat (2 mins)

Try asking questions like:
- "Where can I get mental health support?"
- "I need to see a doctor, what are my options?"
- "Tell me about UMD counseling services"
- "What health insurance do I have as a student?"

## Mock Data

We've included comprehensive mock UMD health resources in `app/lib/health_resources.json`:

- **Mental Health**: Counseling Center, crisis support
- **Primary Care**: University Health Center, appointments
- **Sexual Health**: STI testing, contraception
- **Wellness**: Nutrition, stress management, mindfulness
- **Specialty Care**: Physical therapy, sports medicine
- **Insurance**: Student health insurance information
- **Emergency Contacts**: Crisis hotlines, emergency services

## How It Works (No AWS Required!)

Unlike the original quickstart which uses AWS Bedrock for knowledge retrieval, we've simplified this to use **local mock data**:

1. User asks a question
2. `utils.ts` searches `health_resources.json` using keyword matching
3. Relevant resources are passed to Claude as context
4. Claude generates a helpful response based on UMD resources

This means:
- ✅ No AWS credentials needed
- ✅ Faster development
- ✅ Works offline
- ✅ Easy to customize resources

## Customization Tips

### Add More Health Resources

Edit `app/lib/health_resources.json` to add more UMD services:

```json
{
  "id": "new-service",
  "category": "Category Name",
  "title": "Service Title",
  "content": "Detailed description...",
  "contact": "Phone number",
  "location": "Building name"
}
```

### Modify System Prompt

Edit `app/api/chat/route.ts` to change how the AI assistant behaves (search for `systemPrompt`).

### Change Categories

Edit `app/lib/health_categories.json` to modify health categories.

### UI Customization

- Colors/themes: `app/globals.css` and `styles/themes.js`
- Components: `components/` directory
- Sidebar toggle: Use different npm scripts (`dev:left`, `dev:right`, `dev:chat`)

## Available Scripts

```bash
npm run dev         # Full app with both sidebars
npm run dev:chat    # Chat only (no sidebars) - RECOMMENDED FOR HACKATHON
npm run dev:left    # Left sidebar only
npm run dev:right   # Right sidebar only
npm run build       # Production build
```

## Next Steps

1. **Test the basic chat** - Make sure everything works
2. **Customize the UI** - Change colors, branding, layout
3. **Expand the database** - Add more UMD-specific resources
4. **Add features** - Consider adding:
   - Patient PDF upload/parsing
   - Appointment booking
   - Symptom checker
   - Resource filtering
   - Chat history

## Troubleshooting

**"API key not found" error:**
- Make sure `.env.local` exists and has your API key
- Restart the dev server after adding the key

**"Module not found" errors:**
- Run `npm install` to install dependencies

**Port 3000 already in use:**
- Kill the process using port 3000 or run `npm run dev -- -p 3001`

## Resources

- [Claude API Documentation](https://docs.anthropic.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Original Quickstart README](./README.md)

## License

MIT (from original Anthropic Quickstart)
