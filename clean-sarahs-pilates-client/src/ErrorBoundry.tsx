// src/ErrorBoundary.tsx
import React from "react";
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err?: Error }
> {
  state = { err: undefined };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  componentDidCatch(err: Error, info: any) {
    console.error("UI error:", err, info);
  }
  render() {
    return this.state.err ? (
      <pre style={{ padding: 16 }}>
        Something broke: {String(this.state.err)}
      </pre>
    ) : (
      this.props.children
    );
  }
}
