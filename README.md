# Avalon Game Assistant

A mobile-first assistant application for **Avalon Big Box Edition** board game, built with Vue.js and Vuetify.

## 🛡️ Game Features

- **Character Selection** - Choose from all Avalon Big Box Edition characters
- **Character Limits** - Enforces maximum count per character type (e.g., only 1 Merlin, up to 4 Loyal Servants)
- **Smart Validation** - Ensures correct character distribution for different player counts
- **Game Master Mode** - Automated narration with speech synthesis
- **Mobile-First Design** - Optimized for tablets and phones during gameplay
- **Speech Synthesis** - Uses Web Speech API to read game instructions aloud

## ⚔️ Supported Characters

### Good Characters
- **Merlin** - Knows all evil characters except Mordred
- **Percival** - Knows who Merlin and Morgana are, but not which is which  
- **Loyal Servant of Arthur** - Basic good character

### Evil Characters
- **Assassin** - Can assassinate Merlin at the end of the game
- **Morgana** - Appears as Merlin to Percival
- **Mordred** - Hidden from Merlin
- **Oberon** - Unknown to other evil characters
- **Minion of Mordred** - Basic evil character

## 🚀 Features

- **Mobile-First Design** - Optimized for mobile devices with responsive layouts
- **Vue 3** with Composition API
- **Vuetify 3** for beautiful Material Design components
- **TypeScript** for type safety
- **Speech Synthesis** - Web Speech API integration
- **Touch-Friendly UI** with proper touch targets and gestures
- **Progressive Web App** ready with mobile optimizations

## 📦 Tech Stack

- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Vuetify 3](https://vuetifyjs.com/) - Material Design component framework
- [Vite](https://vitejs.dev/) - Fast build tool
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Material Design Icons](https://materialdesignicons.com/) - Icon library

## 🛠️ Development

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. When you push to the `main` branch, the site will automatically build and deploy.

#### Setup Steps:

1. Push your code to a GitHub repository
2. Go to your repository Settings > Pages
3. Select "GitHub Actions" as the source
4. Your site will be available at `https://yourusername.github.io/avalonspeaks/`

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

This will build the project and push it to the `gh-pages` branch.

## 📁 Project Structure

```
src/
├── components/          # Vue components
├── plugins/            # Vue plugins (Vuetify configuration)
├── assets/             # Static assets
├── App.vue            # Main application component
└── main.ts            # Application entry point
```

## 🎨 Vuetify Configuration

Vuetify is configured in `src/plugins/vuetify.ts` with:
- Material Design Icons
- Default light theme
- Auto-import of components and directives

## 📝 Development Guidelines

- Use Vue 3 Composition API syntax
- Follow Vuetify design guidelines
- Utilize TypeScript for better type safety
- Follow Vue.js best practices for component structure

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages manually

## 📚 Resources

- [Vue.js Documentation](https://vuejs.org/guide/)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
