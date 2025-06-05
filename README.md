# Modern Next.js Boilerplate

A modern, full-stack Next.js boilerplate with Convex, Tailwind CSS v4, Shadcn UI, Zustand, and Zod.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Database & Backend**: [Convex](https://www.convex.dev/) - Type-safe, real-time database and backend
- **Styling**: 
  - [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
  - [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - Simple, fast state management
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Language**: TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

3. Set up Convex:
```bash
npx convex dev
```

4. Create a `.env.local` file:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- ⚡️ Full-stack React with Next.js 14
- 📱 First-class mobile experience
- 🎨 Modern UI with Shadcn components
- 🔄 Real-time data synchronization with Convex
- 🎯 Type-safe database queries and mutations
- 📊 Simple and scalable state management with Zustand
- 🔍 Form validation with Zod
- 🎭 Dark mode support
- 📱 Responsive design system
- 🔒 Type safety with TypeScript
- 🎨 Modern CSS with Tailwind v4

## Project Structure

```
.
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   └── ui/       # Shadcn UI components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions and configurations
├── convex/           # Convex backend
├── public/           # Static assets
└── ...config files
```

## Development

### Adding New Shadcn Components

```bash
npx shadcn@latest add [component-name]
```

### State Management

We use Zustand for state management. Create stores in `src/lib/stores/`.

### Styling

This project uses Tailwind CSS v4 with the new CSS variables system. Configure theme in your CSS:

```css
@import "tailwindcss";

@theme {
  --font-display: "Geist", "sans-serif";
  --color-primary: oklch(0.84 0.18 117.33);
}
```

## Deployment

Deploy on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to a Git repository
2. Import your project into Vercel
3. Add your environment variables
4. Deploy!

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zod Documentation](https://zod.dev/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
