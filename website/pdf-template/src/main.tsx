
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/noto-sans-devanagari/400.css';
import '@fontsource/noto-sans-devanagari/700.css';

import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<App />);
  