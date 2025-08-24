# Contributing to ODABA Gemini Chat

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/odaba-gemini.git
   cd odaba-gemini
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   Create a `.env` file with your Gemini API key:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
odaba-gemini/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Entry point
│   └── assets/          # Static assets
├── public/               # Public assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## Development Guidelines

### Code Style

- **TypeScript:** Use strict typing, avoid `any` when possible
- **React:** Use functional components with hooks
- **CSS:** Use Tailwind CSS classes, avoid custom CSS when possible
- **Naming:** Use descriptive names, follow camelCase for variables and PascalCase for components

### Component Structure

```typescript
// Component example
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks at the top
  const [state, setState] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    setState(!state);
    onAction?.();
  };
  
  // Render
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
};
```

### State Management

- Use React hooks for local state
- Keep state as close to where it's used as possible
- Use `useMemo` and `useCallback` for performance optimization when needed
- Store persistent data in localStorage (already implemented)

### Error Handling

- Always handle API errors gracefully
- Show user-friendly error messages
- Log errors to console for debugging
- Use try-catch blocks around async operations

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clear, focused commits
- Test your changes thoroughly
- Ensure the app builds without errors
- Check that all existing functionality still works

### 3. Testing

```bash
# Run linting
npm run lint

# Build the project
npm run build

# Preview the build
npm run preview
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## Pull Request Guidelines

### Before Submitting

1. **Ensure code quality:**
   - No linting errors
   - Builds successfully
   - All tests pass (if applicable)

2. **Update documentation:**
   - Update README.md if needed
   - Add comments for complex logic
   - Update any relevant configuration files

3. **Test thoroughly:**
   - Test on different screen sizes
   - Test with different browsers
   - Test edge cases and error scenarios

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] All existing functionality works
- [ ] No console errors
- [ ] Responsive design maintained

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No console errors or warnings
- [ ] Builds successfully
```

## Code Review Process

1. **Automated checks** will run on your PR
2. **Maintainers** will review your code
3. **Address feedback** and make requested changes
4. **Squash commits** if requested
5. **Merge** when approved

## Common Issues and Solutions

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

- Check that all props are properly typed
- Ensure all required props are provided
- Use proper type annotations for API responses

### Styling Issues

- Use Tailwind CSS classes when possible
- Check responsive design on different screen sizes
- Ensure dark/light theme compatibility

## Getting Help

- **Issues:** Check existing issues before creating new ones
- **Discussions:** Use GitHub Discussions for questions
- **Documentation:** Read through README.md and other docs
- **Code examples:** Look at existing components for patterns

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

## Thank You

Thank you for contributing to make this project better! Your contributions help improve the experience for all users.
