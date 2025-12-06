# Marginalia Memes

A medieval-themed meme generator built with Next.js, React, TypeScript, Tailwind CSS, and Fabric.js.

## Features

- Upload custom images or choose from premade medieval scenes
- Add and edit text overlays with customizable:
  - Font family (medieval fonts)
  - Font size
  - Text color
  - Stroke color and width
- Drag and drop images
- Export memes as PNG images
- Beautiful medieval-themed UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add premade images:
   - Place medieval scene images in `public/images/premade/`
   - Update `src/data/premade-images.ts` if you add more images

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
├── data/            # Static data
└── styles/          # Global styles
```

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Fabric.js** - Canvas manipulation
- **React Color** - Color picker component

## License

MIT

