import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Bilinmeyen hata' };
  }

  componentDidCatch(error: Error) {
    console.error('AWRX ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-[#080808]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Bir şeyler ters gitti</h1>
            <p className="text-sm text-neutral-400 mb-6">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-white text-black rounded-xl font-medium text-sm hover:bg-neutral-200 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
