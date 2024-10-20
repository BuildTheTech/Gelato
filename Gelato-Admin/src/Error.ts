import { Component, ErrorInfo, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }> {
  constructor(props: { children: ReactNode }) {
    super(props);
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error);
    console.info(info);
  }

  render() {
    return this.props.children;
  }
}
