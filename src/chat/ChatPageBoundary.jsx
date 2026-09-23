import { Component } from 'react';

// A legacy conversation must never be able to blank the complete dashboard.
// The detailed error remains available in the browser console for diagnosis,
// while the learner gets a clear way to return to the chat list.
export default class ChatPageBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Chat rendering error:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="nschat-page">
          <section className="nschat-card nschat-empty" role="alert">
            <strong>Impossible d’afficher cette conversation.</strong>
            <p>La discussion contient une ancienne donnée non compatible. Retournez à la liste puis réessayez.</p>
            <button type="button" className="nschat-new-message" onClick={() => this.setState({ failed: false })}>Réessayer</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
