# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Learn Word** is a modern, mobile-first English vocabulary learning application built with Vue 3. The app provides an intuitive and engaging way to learn English words through spaced repetition, progress tracking, and interactive exercises.

## Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Dark Mode**: VueUse/useDark
- **Icons**: SVG icons embedded in components
- **Storage**: LocalStorage for data persistence
- **Deployment**: Static web hosting ready

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/           # Vue components
│   ├── BottomNavigation.vue    # Main navigation
│   ├── Courses.vue             # Course management
│   ├── CourseSelection.vue     # Course picker
│   ├── LetterInputPanel.vue    # Keyboard input for spelling
│   ├── Profile.vue             # User profile and settings
│   ├── TodayStudy.vue          # Main learning interface
│   ├── WelcomeGuide.vue        # First-time user guide
│   └── WordList.vue            # Error/Learned words lists
├── utils/               # Utility functions
│   └── studyData.js           # Data management and persistence
├── views/               # Page components
│   └── Home.vue                # Main application container
├── App.vue              # Root component with layout
├── style.css            # Global styles and Tailwind imports
└── main.js              # Application entry point
```

## Key Features

### Learning System
- **Daily Goals**: Configurable daily word targets with progress tracking
- **Smart Keyboard Layout**: Adaptive letter input based on assist mode setting
  - Assist mode: Shows only word letters in random positions
  - Normal mode: Word letters + extra干扰 letters, fully randomized
- **Audio Pronunciation**: Built-in speech synthesis for English word pronunciation
- **Interactive Spelling**: Touch-friendly keyboard with visual feedback
- **Motivational Design**: Encouraging confirmation dialogs with random motivational quotes
- **Course Management**: Dynamic course selection with search and progress tracking

### User Interface
- **Mobile-First Design**: Optimized for touch devices with proper spacing
- **Dark/Light Mode**: System-aware theme switching
- **Glass Morphism UI**: Modern, translucent design elements
- **Smooth Animations**: Polished transitions and micro-interactions
- **Search Functionality**: Quick access to courses and word lists
- **Responsive Layout**: Adaptive design for different screen sizes

### Data Management
- **JSON-based Storage**: All data stored in localStorage as JSON
- **Session Persistence**: Resume learning sessions seamlessly
- **Progress Statistics**: Track learning time, accuracy, and streaks
- **Error Tracking**: Separate lists for learned and error words

### User Experience
- **Responsive Design**: Optimized for mobile devices
- **Dark Mode**: System-aware dark/light theme
- **Gesture Support**: Touch-optimized interactions
- **Smooth Animations**: Polished transitions and micro-interactions

## Architecture Notes

### Component Hierarchy
- **App.vue**: Main layout with navigation and content area
- **Home.vue**: Tab-based content management (today/courses/profile)
- **TodayStudy.vue**: Learning interface with multiple states (ready/studying/completed)
- **Profile.vue**: User settings with sub-navigation and modal flows

### State Management
- **Local State**: Vue 3 Composition API for component state
- **Global Events**: Custom events for cross-component communication
- **Persistent Storage**: localStorage utilities in `studyData.js`

### Styling Strategy
- **Tailwind CSS**: Utility-first CSS framework
- **Glass Morphism**: Modern UI with backdrop filters
- **Responsive Breakpoints**: Mobile-first approach with key breakpoints at 480px and 380px
- **Custom Animations**: CSS keyframes for smooth interactions

## Recent Development Focus

### UI/UX Improvements
- **Optimized letter input panel**: Smart keyboard layout based on assist mode
  - Assist mode: Only shows word letters with random positions
  - Normal mode: Word letters + 50% extra干扰 letters, fully randomized
- **Fixed layout issues**: Proper flex height management and responsive design
- **Enhanced visual hierarchy**: Improved spacing and alignment across components
- **Course selection UI**: Changed from cards to list view with search functionality
- **Word list enhancements**: Added search for both error and learned words lists
- **Profile improvements**: Fixed user card statistics layout and centering

### Layout Optimizations
- **Dynamic keyboard layouts**: Context-aware letter input based on learning mode
- **Responsive design**: Optimized for mobile devices with proper touch targets
- **Navigation synchronization**: Fixed tab switching state management
- **Centered content**: Proper alignment for Chinese text and UI elements

### Learning Experience Enhancements
- **Speech synthesis**: Added audio pronunciation for English words using Web Speech API
- **Start study confirmation**: Encouraging confirmation dialog with motivational quotes
- **Progress tracking**: Enhanced today's progress card with current course display
- **Button layout improvements**: Better organization of action buttons in learning interface

### Data Structure Enhancements
- **Session management**: Robust handling of interrupted learning flows
- **Search functionality**: Implemented search across course selection and word lists
- **State synchronization**: Better communication between components using custom events

## Development Guidelines

### When Working on This Project:
1. **Mobile-First**: Always test on small screens first
2. **Touch-Friendly**: Ensure all interactive elements meet minimum touch targets (44px)
3. **Performance**: Use flex layout and avoid unnecessary reflows
4. **Accessibility**: Maintain semantic HTML and proper ARIA labels
5. **Data Safety**: Always validate and handle localStorage gracefully

### Common Issues and Solutions:
- **Button Sizing**: Use flex layout with `flex: 1` for keyboard buttons, or fixed sizes for uniformity
- **Height Management**: Use `min-height: 0` with flex containers to prevent overflow
- **Responsive Design**: Test thoroughly at 380px, 480px, and larger breakpoints
- **State Management**: Use custom events for parent-child communication
- **Keyboard Layout**: Dynamic keyboard generation based on assist mode and word length
- **Audio Features**: Web Speech API integration with proper browser compatibility checks
- **Centering Issues**: Use grid layout (`grid place-items-center`) for perfect content centering

## Deployment Notes

- **Static Hosting**: Suitable for GitHub Pages, Netlify, Vercel, etc.
- **Build Output**: Dist folder contains optimized static assets
- **PWA Ready**: Can be enhanced with service worker for offline usage