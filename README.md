# ChatX

A sleek, terminal-themed chat interface for AI interactions. Live at [https://www.chatx0.tech/](https://www.chatx0.tech/)


## Features

- 🖥️ Terminal-inspired UI with dark theme
- 🤖 Multiple AI model support
  - Llama 3.3 70B (via Groq)
  - Gemini 1.5 Flash (via Google)
- 💾 Local storage for chat persistence
- ⌨️ Rich keyboard shortcuts
  - `Ctrl + K` - Command menu
  - `Ctrl + /` - Toggle sidebar
  - `Esc` - Close sidebar
- 📱 Fully responsive design
- 🗂️ File explorer-style chat navigation
- ⚡ Real-time streaming responses
- 🎨 Code syntax highlighting
- 📝 Markdown support

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand for state management
- Groq & Google AI APIs

## Development

1. Clone the repository
```bash
git clone https://github.com/StarKnightt/ChatX
cd chatx
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Required environment variables:
- `GROQ_API_KEY` - Get from [groq.com](https://groq.com)
- `GOOGLE_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com)

4. Run development server
```bash
npm run dev
```

## Deployment

The project is deployed on Vercel. For your own deployment:

1. Fork this repository
2. Import to Vercel
3. Set up environment variables
4. Deploy!

## License

MIT License - feel free to use this project for learning or building your own chat interface.

## Credits

Built with ❤️ using Next.js and modern web technologies. Special thanks to Groq and Google for their AI APIs.
