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
- **Audio**: Web Speech API with dedicated audio service
- **Dialog System**: Custom dialog management with AppDialog and DialogManager
- **Composables**: Vue 3 composables for reusable logic (useDialog)
- **Storage**: LocalStorage for data persistence
- **Data Structure**: JSON-based course and settings management
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
│   ├── common/                  # Shared components
│   │   ├── AppDialog.vue       # Reusable dialog component
│   │   ├── DialogManager.vue   # Multi-dialog management
│   │   └── WordCard.vue        # Word display card with audio
│   ├── BottomNavigation.vue    # Main navigation
│   ├── Courses.vue             # Course management
│   ├── CourseSelection.vue     # Course picker
│   ├── LetterInputPanel.vue    # Keyboard input for spelling
│   ├── LetterInputPanelV2.vue  # Enhanced keyboard input
│   ├── ListenStep.vue          # Listening comprehension step
│   ├── PhonicsStep.vue         # Phonics learning step
│   ├── Profile.vue             # User profile and settings
│   ├── RecordStep.vue          # Recording practice step
│   ├── SpellingStep.vue        # Spelling practice step
│   ├── StepIndicator.vue       # Learning progress indicator
│   ├── TestStep.vue            # Testing step
│   ├── TodayStudy.vue          # Main learning interface
│   ├── WelcomeGuide.vue        # First-time user guide
│   └── WordList.vue            # Error/Learned words lists
├── composables/        # Vue composables
│   └── useDialog.js           # Dialog management composable
├── config/              # Configuration constants
│   └── constants.js           # Centralized application constants
├── data/                # Static data files
│   ├── app_settings.json      # Application settings
│   └── courses_data.json      # Course vocabulary data
├── examples/            # Example code
│   └── dialog-examples.js     # Dialog usage examples
├── utils/               # Utility functions
│   ├── audioService.js        # Audio playback service
│   ├── coursesParser.js       # Course data parsing
│   └── studyData.js           # Data management and persistence
├── views/               # Page components
│   └── Home.vue                # Main application container
├── App.vue              # Root component with layout
├── style.css            # Global styles and Tailwind imports
└── main.js              # Application entry point
```

## Key Features

### Learning System
- **Multi-Step Learning**: Comprehensive 5-step learning process for each word
  - **Listen Step**: Audio comprehension and pronunciation practice
  - **Phonics Step**: Phonetic breakdown and sound patterns
  - **Spelling Step**: Interactive spelling with smart keyboard
  - **Test Step**: Knowledge assessment and recall testing
  - **Record Step**: Voice recording and comparison practice
- **Daily Goals**: Configurable daily word targets with progress tracking
- **Smart Keyboard Layout**: Adaptive letter input based on assist mode setting
  - Assist mode: Shows only word letters in random positions
  - Normal mode: Word letters + extra干扰 letters, fully randomized
- **Audio Pronunciation**: Built-in speech synthesis for English word pronunciation with dedicated audio service
- **Interactive Spelling**: Touch-friendly keyboard with visual feedback and phoneme highlighting
- **Motivational Design**: Encouraging confirmation dialogs with random motivational quotes
- **Course Management**: Dynamic course selection with search and progress tracking
- **Step Progress Indicators**: Visual feedback showing learning progress for each word

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
- **Centralized Configuration**: All constants managed in `config/constants.js` for easy maintenance

### User Experience
- **Responsive Design**: Optimized for mobile devices
- **Dark Mode**: System-aware dark/light theme
- **Gesture Support**: Touch-optimized interactions
- **Smooth Animations**: Polished transitions and micro-interactions

## Architecture Notes

### Component Hierarchy
- **App.vue**: Main layout with navigation and DialogManager
- **Home.vue**: Tab-based content management (today/courses/profile)
- **TodayStudy.vue**: Learning interface with multi-step workflow
  - **StepIndicator.vue**: Progress indicator for learning steps
  - **ListenStep.vue**: Audio comprehension practice
  - **PhonicsStep.vue**: Phonetic learning with WordCard
  - **SpellingStep.vue**: Interactive spelling with LetterInputPanel
  - **TestStep.vue**: Knowledge assessment
  - **RecordStep.vue**: Voice recording practice
- **Profile.vue**: User settings with sub-navigation and modal flows
- **Common Components**:
  - **AppDialog.vue**: Reusable dialog with multiple types (info/warning/error)
  - **WordCard.vue**: Word display with phoneme highlighting and audio
  - **DialogManager.vue**: Multi-dialog state management

### State Management
- **Local State**: Vue 3 Composition API for component state
- **Global Events**: Custom events for cross-component communication
- **Dialog System**: Centralized dialog management with useDialog composable
- **Audio Service**: Dedicated service for speech synthesis and audio playback
- **Persistent Storage**: localStorage utilities in `studyData.js`
- **Data Management**: JSON-based course data parsing and settings management

### Styling Strategy
- **Tailwind CSS**: Utility-first CSS framework
- **Glass Morphism**: Modern UI with backdrop filters
- **Responsive Breakpoints**: Mobile-first approach with key breakpoints at 480px and 380px
- **Custom Animations**: CSS keyframes for smooth interactions

## Recent Development Focus

### Multi-Step Learning System
- **5-Step Learning Workflow**: Complete learning process with Listen, Phonics, Spelling, Test, and Record steps
- **Step Indicator Component**: Visual progress tracking through learning stages
- **Enhanced WordCard**: Phoneme highlighting, audio integration, and responsive sizing
- **Specialized Step Components**: Dedicated components for each learning modality
- **Audio Service Integration**: Centralized audio playback with Web Speech API

### Dialog Management System
- **AppDialog Component**: Reusable dialog with multiple types (info/warning/error)
- **DialogManager**: Multi-dialog state management to prevent conflicts
- **useDialog Composable**: Simplified dialog usage with one-line API calls
- **Dialog Examples**: Comprehensive usage patterns and best practices

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
- **Dialog Conflicts**: Use DialogManager for multiple dialogs to avoid key conflicts
- **Step Navigation**: Use proper step state management in multi-step learning flows
- **Component Naming**: Maintain clear distinction between step components (ListenStep, PhonicsStep, etc.)
- **Constants Management**: All hardcoded values are centralized in `config/constants.js` - use these instead of magic numbers

## Deployment Notes

- **Static Hosting**: Suitable for GitHub Pages, Netlify, Vercel, etc.
- **Build Output**: Dist folder contains optimized static assets
- **PWA Ready**: Can be enhanced with service worker for offline usage
- 不用每次修改完都检查开发服务器状态了，有编译问题我会提示你。
- 命名变量、方法等要素的时候，要注意当前元素在上下文的区分度，避免命名冲突。
- 除CSS外，使用配置常量替代硬编码值，参考src\config\constants.js